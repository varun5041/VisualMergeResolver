package com.visualmerge.git;

import com.visualmerge.model.RepositoryBranch;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.LsRemoteCommand;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * All Git access goes through JGit — there is no shelling out, so no
 * user-supplied text is ever interpreted as a command.
 *
 * <p>Phase 1 uses two operations: {@code ls-remote} to validate a repository and
 * list its branches without downloading anything, and a bare clone that gives
 * later phases a local object database to do real merge analysis against.
 */
@Service
public class GitService {

    private static final Logger log = LoggerFactory.getLogger(GitService.class);

    private static final DateTimeFormatter TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneOffset.UTC);

    /**
     * Confirms the repository exists and is readable, without cloning it.
     *
     * @return the remote refs, which already tell us the branch list
     */
    public Collection<Ref> listRemoteRefs(RepositoryUrl url, int timeoutSeconds) {
        LsRemoteCommand command = Git.lsRemoteRepository()
                .setRemote(url.cloneUrl())
                .setHeads(true)
                .setTags(false)
                .setTimeout(timeoutSeconds);
        try {
            return command.call();
        } catch (InvalidRemoteException e) {
            throw GitOperationException.notFound(url.fullName());
        } catch (TransportException e) {
            throw translateTransportFailure(url, e);
        } catch (GitAPIException e) {
            throw GitOperationException.cloneFailed(url.fullName(), e);
        }
    }

    /**
     * Clones the repository into an already-prepared, isolated directory.
     *
     * <p>The clone is bare: no working tree is written, which keeps it small and
     * means nothing from the repository is ever executed. Working trees for
     * individual branches are created later, in their own directories.
     */
    public void cloneBare(RepositoryUrl url, Path destination, int timeoutSeconds) {
        try {
            cloneFrom(url.cloneUrl(), destination, timeoutSeconds);
            log.debug("Cloned {} into an isolated workspace", url.fullName());
        } catch (InvalidRemoteException e) {
            throw GitOperationException.notFound(url.fullName());
        } catch (TransportException e) {
            throw translateTransportFailure(url, e);
        } catch (GitAPIException e) {
            throw GitOperationException.cloneFailed(url.fullName(), e);
        }
    }

    /**
     * The raw clone. Only reached with a URI this service built itself from a
     * validated {@link RepositoryUrl}; tests use it against local fixtures.
     */
    void cloneFrom(String remoteUri, Path destination, int timeoutSeconds) throws GitAPIException {
        File target = destination.toFile();
        try (Git ignored = Git.cloneRepository()
                .setURI(remoteUri)
                .setDirectory(target)
                .setBare(true)
                .setCloneAllBranches(true)
                .setNoCheckout(true)
                .setTimeout(timeoutSeconds)
                .call()) {
            // The clone is bare: objects and refs only, no working tree, nothing executed.
        }
    }

    /** Opens a previously cloned repository. Caller closes it. */
    public Repository open(Path repositoryPath) throws IOException {
        return Git.open(repositoryPath.toFile()).getRepository();
    }

    /**
     * Lists the branches of a cloned repository with their tip commit details.
     *
     * <p>A bare clone stores the remote branches under {@code refs/heads/*}, so
     * this reads local heads and falls back to remote-tracking refs.
     */
    public List<RepositoryBranch> listBranches(Path repositoryPath, String defaultBranch) {
        List<RepositoryBranch> branches = new ArrayList<>();
        try (Repository repository = open(repositoryPath);
             RevWalk walk = new RevWalk(repository)) {

            Map<String, Ref> refs = repository.getRefDatabase().getRefs().stream()
                    .filter(ref -> ref.getName().startsWith(Constants.R_HEADS)
                            || ref.getName().startsWith(Constants.R_REMOTES))
                    .collect(java.util.stream.Collectors.toMap(
                            Ref::getName, ref -> ref, (a, b) -> a, java.util.LinkedHashMap::new));

            for (Ref ref : refs.values()) {
                String name = shortBranchName(ref.getName());
                if (name == null || name.equals("HEAD")) {
                    continue;
                }
                ObjectId objectId = ref.getObjectId();
                if (objectId == null) {
                    continue;
                }
                RevCommit commit;
                try {
                    commit = walk.parseCommit(objectId);
                } catch (IOException e) {
                    continue;
                }
                branches.add(new RepositoryBranch(
                        name,
                        ref.getName(),
                        objectId.getName(),
                        objectId.getName().substring(0, 7),
                        firstLine(commit.getFullMessage()),
                        commit.getAuthorIdent() == null ? "unknown" : commit.getAuthorIdent().getName(),
                        TIMESTAMP.format(Instant.ofEpochSecond(commit.getCommitTime())),
                        name.equals(defaultBranch)));
            }
        } catch (IOException e) {
            throw new GitOperationException(
                    GitOperationException.Code.WORKSPACE_ERROR,
                    "Could not read the cloned repository.", e);
        }

        branches.sort(Comparator
                .comparing(RepositoryBranch::isDefault).reversed()
                .thenComparing(RepositoryBranch::name, String.CASE_INSENSITIVE_ORDER));
        return branches;
    }

    /** Reads the repository's default branch (what HEAD points at on the remote). */
    public String resolveDefaultBranch(Path repositoryPath, Collection<Ref> remoteRefs) {
        try (Repository repository = open(repositoryPath)) {
            Ref head = repository.getRefDatabase().findRef(Constants.HEAD);
            if (head != null && head.getTarget() != null) {
                String name = shortBranchName(head.getTarget().getName());
                if (name != null && !name.equals("HEAD")) {
                    return name;
                }
            }
        } catch (IOException e) {
            log.debug("Could not read HEAD from the clone, falling back to remote refs");
        }
        for (String candidate : List.of("main", "master", "develop")) {
            boolean present = remoteRefs.stream()
                    .anyMatch(ref -> candidate.equals(shortBranchName(ref.getName())));
            if (present) {
                return candidate;
            }
        }
        return remoteRefs.stream()
                .map(ref -> shortBranchName(ref.getName()))
                .filter(name -> name != null && !name.equals("HEAD"))
                .findFirst()
                .orElseThrow(() -> new GitOperationException(
                        GitOperationException.Code.NO_BRANCHES,
                        "That repository has no branches to compare."));
    }

    static String shortBranchName(String refName) {
        if (refName == null) {
            return null;
        }
        if (refName.startsWith(Constants.R_HEADS)) {
            return refName.substring(Constants.R_HEADS.length());
        }
        if (refName.startsWith(Constants.R_REMOTES)) {
            String withoutPrefix = refName.substring(Constants.R_REMOTES.length());
            int slash = withoutPrefix.indexOf('/');
            return slash >= 0 ? withoutPrefix.substring(slash + 1) : withoutPrefix;
        }
        return refName;
    }

    private static String firstLine(String message) {
        if (message == null || message.isBlank()) {
            return "(no commit message)";
        }
        String line = message.strip().split("\r?\n", 2)[0];
        return line.length() > 120 ? line.substring(0, 117) + "…" : line;
    }

    /**
     * Turns a transport failure into a useful, non-leaking error. JGit reports
     * "not found" and "auth required" through the same exception type, and
     * GitHub answers 404 for private repositories to anonymous clients.
     */
    private GitOperationException translateTransportFailure(RepositoryUrl url, TransportException e) {
        String message = e.getMessage() == null ? "" : e.getMessage().toLowerCase(Locale.ROOT);
        if (message.contains("not found") || message.contains("repository not found")) {
            return GitOperationException.notFound(url.fullName());
        }
        // GitHub answers anonymous requests for a missing repository and for a
        // private one identically — it asks for credentials in both cases. The
        // honest reading is "not found for you", with private called out.
        if (message.contains("authentication is required")
                || message.contains("not authorized")
                || message.contains("401")) {
            return GitOperationException.notFound(url.fullName());
        }
        if (message.contains("forbidden") || message.contains("403")
                || message.contains("access denied") || message.contains("authentication")) {
            return GitOperationException.inaccessible(url.fullName());
        }
        if (message.contains("timed out") || message.contains("timeout")) {
            return new GitOperationException(
                    GitOperationException.Code.CLONE_TIMEOUT,
                    "GitHub did not respond in time for " + url.fullName() + ".", e);
        }
        return GitOperationException.cloneFailed(url.fullName(), e);
    }
}
