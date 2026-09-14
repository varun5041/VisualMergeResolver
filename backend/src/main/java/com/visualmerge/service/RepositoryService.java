package com.visualmerge.service;

import com.visualmerge.config.WorkspaceProperties;
import com.visualmerge.git.GitOperationException;
import com.visualmerge.git.GitService;
import com.visualmerge.git.RepositoryUrl;
import com.visualmerge.model.GitRepository;
import com.visualmerge.model.RepositoryBranch;
import jakarta.annotation.PreDestroy;
import org.eclipse.jgit.lib.Ref;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Connects real public GitHub repositories: validate, clone into an isolated
 * workspace, discover branches, and clean up afterwards.
 *
 * <p>The user's own repository is only ever read. Nothing is pushed, committed
 * or modified upstream by any operation here.
 */
@Service
public class RepositoryService {

    private static final Logger log = LoggerFactory.getLogger(RepositoryService.class);

    /** Repository id -> everything we know about it, including its private workspace. */
    private final ConcurrentHashMap<String, ConnectedRepository> connected = new ConcurrentHashMap<>();

    private final GitService gitService;
    private final WorkspaceService workspaceService;
    private final WorkspaceProperties properties;
    private final ExecutorService cloneExecutor =
            Executors.newFixedThreadPool(2, runnable -> {
                Thread thread = new Thread(runnable, "visualmerge-clone");
                thread.setDaemon(true);
                return thread;
            });

    public RepositoryService(GitService gitService,
                             WorkspaceService workspaceService,
                             WorkspaceProperties properties) {
        this.gitService = gitService;
        this.workspaceService = workspaceService;
        this.properties = properties;
    }

    /** A connected repository and the internal workspace backing it. */
    public record ConnectedRepository(GitRepository metadata, String sessionId, Path repositoryPath) {}

    /** The outcome of a validation-only check. */
    public record ValidationResult(RepositoryUrl url, int branchCount) {}

    /**
     * Validates a repository URL without cloning. Cheap enough to call on its own.
     *
     * @return the parsed URL and its real branch count, if the repository is readable
     */
    public ValidationResult validate(String rawUrl) {
        RepositoryUrl url = RepositoryUrl.parse(rawUrl);
        long started = System.currentTimeMillis();
        Collection<Ref> refs;
        try {
            refs = gitService.listRemoteRefs(url, timeoutSeconds());
        } catch (GitOperationException e) {
            log.info("validate repository={} duration={}ms result={}",
                    url.fullName(), System.currentTimeMillis() - started, e.code());
            throw e;
        }
        if (refs.isEmpty()) {
            log.info("validate repository={} duration={}ms result=NO_BRANCHES",
                    url.fullName(), System.currentTimeMillis() - started);
            throw new GitOperationException(
                    GitOperationException.Code.NO_BRANCHES,
                    "That repository has no branches to compare.");
        }
        log.info("validate repository={} branches={} duration={}ms result=OK",
                url.fullName(), refs.size(), System.currentTimeMillis() - started);
        return new ValidationResult(url, refs.size());
    }

    /**
     * Validates, clones and indexes a repository.
     *
     * <p>The clone runs on a bounded executor so a slow or hostile remote cannot
     * hold a request thread open indefinitely.
     */
    public GitRepository connect(String rawUrl) {
        RepositoryUrl url = RepositoryUrl.parse(rawUrl);
        long started = System.currentTimeMillis();

        Collection<Ref> remoteRefs;
        try {
            remoteRefs = gitService.listRemoteRefs(url, timeoutSeconds());
        } catch (GitOperationException e) {
            log.info("connect repository={} duration={}ms result={} stage=validate",
                    url.fullName(), System.currentTimeMillis() - started, e.code());
            throw e;
        }
        if (remoteRefs.isEmpty()) {
            log.info("connect repository={} duration={}ms result=NO_BRANCHES",
                    url.fullName(), System.currentTimeMillis() - started);
            throw new GitOperationException(
                    GitOperationException.Code.NO_BRANCHES,
                    "That repository has no branches to compare.");
        }

        String sessionId = workspaceService.createSession();
        Path repositoryPath = workspaceService.repositoryPath(sessionId);

        try {
            runCloneWithTimeout(url, repositoryPath);

            long sizeKb = workspaceService.sizeKb(sessionId);
            if (sizeKb > workspaceService.maxSizeKb()) {
                workspaceService.deleteSession(sessionId);
                log.info("connect repository={} duration={}ms result=TOO_LARGE sizeKb={}",
                        url.fullName(), System.currentTimeMillis() - started, sizeKb);
                throw new GitOperationException(
                        GitOperationException.Code.REPOSITORY_TOO_LARGE,
                        "That repository is larger than the "
                                + properties.getMaxRepositorySizeMb() + " MB limit for this preview.");
            }

            String defaultBranch = gitService.resolveDefaultBranch(repositoryPath, remoteRefs);
            List<RepositoryBranch> branches = gitService.listBranches(repositoryPath, defaultBranch);
            if (branches.isEmpty()) {
                workspaceService.deleteSession(sessionId);
                throw new GitOperationException(
                        GitOperationException.Code.NO_BRANCHES,
                        "That repository has no branches to compare.");
            }

            String id = "repo_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            GitRepository metadata = new GitRepository(
                    id,
                    url.owner(),
                    url.name(),
                    url.fullName(),
                    url.webUrl(),
                    defaultBranch,
                    branches.size(),
                    sizeKb,
                    Instant.now().toString(),
                    "READY",
                    branches);

            connected.put(id, new ConnectedRepository(metadata, sessionId, repositoryPath));

            log.info("connect repository={} id={} branches={} sizeKb={} duration={}ms result=OK",
                    url.fullName(), id, branches.size(), sizeKb, System.currentTimeMillis() - started);
            return metadata;

        } catch (GitOperationException e) {
            workspaceService.deleteSession(sessionId);
            log.info("connect repository={} duration={}ms result={} reason={}",
                    url.fullName(), System.currentTimeMillis() - started, e.code(), e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            workspaceService.deleteSession(sessionId);
            log.error("connect repository={} duration={}ms result=FAILED",
                    url.fullName(), System.currentTimeMillis() - started, e);
            throw GitOperationException.cloneFailed(url.fullName(), e);
        }
    }

    private void runCloneWithTimeout(RepositoryUrl url, Path repositoryPath) {
        int timeout = timeoutSeconds();
        Future<?> task = cloneExecutor.submit(
                () -> gitService.cloneBare(url, repositoryPath, timeout));
        try {
            // Allow a little headroom over the transport timeout before giving up.
            task.get(timeout + 15L, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            task.cancel(true);
            throw GitOperationException.cloneTimeout(url.fullName(), timeout);
        } catch (InterruptedException e) {
            task.cancel(true);
            Thread.currentThread().interrupt();
            throw GitOperationException.cloneFailed(url.fullName(), e);
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            if (cause instanceof GitOperationException gitFailure) {
                throw gitFailure;
            }
            throw GitOperationException.cloneFailed(url.fullName(), cause == null ? e : cause);
        }
    }

    public Optional<GitRepository> find(String id) {
        return Optional.ofNullable(connected.get(id)).map(ConnectedRepository::metadata);
    }

    public GitRepository require(String id) {
        return find(id).orElseThrow(() -> GitOperationException.unknownRepository(id));
    }

    /** Internal accessor — the workspace path never leaves the backend. */
    public ConnectedRepository requireConnected(String id) {
        ConnectedRepository repository = connected.get(id);
        if (repository == null) {
            throw GitOperationException.unknownRepository(id);
        }
        return repository;
    }

    public List<RepositoryBranch> branches(String id) {
        return require(id).branches();
    }

    /** Re-reads branches from the existing clone (no network round trip). */
    public GitRepository refreshBranches(String id) {
        ConnectedRepository repository = requireConnected(id);
        List<RepositoryBranch> branches = gitService.listBranches(
                repository.repositoryPath(), repository.metadata().defaultBranch());
        GitRepository updated = repository.metadata()
                .withBranches(branches, repository.metadata().defaultBranch());
        connected.put(id, new ConnectedRepository(
                updated, repository.sessionId(), repository.repositoryPath()));
        return updated;
    }

    /** Drops a repository and deletes its workspace. */
    public boolean disconnect(String id) {
        ConnectedRepository repository = connected.remove(id);
        if (repository == null) {
            return false;
        }
        workspaceService.deleteSession(repository.sessionId());
        log.info("disconnect repository={} id={} result=OK", repository.metadata().fullName(), id);
        return true;
    }

    public List<GitRepository> listConnected() {
        return connected.values().stream().map(ConnectedRepository::metadata).toList();
    }

    private int timeoutSeconds() {
        return Math.max(10, properties.getCloneTimeoutSeconds());
    }

    /** Periodically clears workspaces left behind by abandoned sessions. */
    @Scheduled(fixedDelayString = "PT15M")
    void sweepStaleWorkspaces() {
        workspaceService.cleanupStaleSessions();
    }

    @PreDestroy
    void shutdown() {
        cloneExecutor.shutdownNow();
    }
}
