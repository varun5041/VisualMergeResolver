package com.visualmerge.service;

import com.visualmerge.dto.CreateMergeSessionRequest;
import com.visualmerge.dto.GitHubBranchResponse;
import com.visualmerge.dto.GitHubRepositoryResponse;
import com.visualmerge.dto.MergeSessionStatsResponse;
import com.visualmerge.exception.ForbiddenException;
import com.visualmerge.exception.InvalidRequestException;
import com.visualmerge.exception.NotFoundException;
import com.visualmerge.model.MergeSession;
import com.visualmerge.model.MergeSessionStatus;
import com.visualmerge.model.Repository;
import com.visualmerge.model.User;
import com.visualmerge.repository.MergeSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Creation and retrieval of merge sessions.
 *
 * <p>GitHub access lives in {@link GitHubService} and persistence in the JPA
 * repositories; this service is where the two meet and where ownership is
 * enforced.
 */
@Service
public class MergeSessionService {

    private static final Logger log = LoggerFactory.getLogger(MergeSessionService.class);

    private final MergeSessionRepository sessions;
    private final RepositoryCatalogService catalog;
    private final GitHubService gitHub;

    public MergeSessionService(
            MergeSessionRepository sessions,
            RepositoryCatalogService catalog,
            GitHubService gitHub) {
        this.sessions = sessions;
        this.catalog = catalog;
        this.gitHub = gitHub;
    }

    /**
     * Validates the whole request against GitHub before writing anything.
     *
     * <p>The repository lookup doubles as the access check — GitHub answers 404
     * for repositories a token may not read — and all three branches must
     * actually exist. Only then does a row reach MySQL, so the database never
     * holds a session pointing at branches that were never there.
     */
    @Transactional
    public MergeSession create(User user, String accessToken, CreateMergeSessionRequest request) {
        String owner = request.owner().trim();
        String name = request.repository().trim();
        String base = request.baseBranch().trim();
        String branchA = request.branchA().trim();
        String branchB = request.branchB().trim();

        if (branchA.equals(branchB)) {
            throw InvalidRequestException.identicalBranches(branchA);
        }

        GitHubRepositoryResponse source;
        try {
            source = gitHub.getRepository(accessToken, owner, name);
        } catch (NotFoundException notFound) {
            // Re-thrown with the names the user typed, which is more useful
            // than GitHub's generic wording.
            throw NotFoundException.repository(owner, name);
        }
        if (source.id() == null) {
            throw NotFoundException.repository(owner, name);
        }

        Set<String> branches = gitHub.listBranches(accessToken, owner, name).stream()
                .map(GitHubBranchResponse::name)
                .collect(Collectors.toSet());

        requireBranch(base, branches, source.fullName());
        requireBranch(branchA, branches, source.fullName());
        requireBranch(branchB, branches, source.fullName());

        Repository repository = catalog.remember(user, source);

        MergeSession session = new MergeSession();
        session.setUser(user);
        session.setRepository(repository);
        session.setBaseBranch(base);
        session.setBranchA(branchA);
        session.setBranchB(branchB);
        session.setStatus(MergeSessionStatus.CREATED);

        MergeSession saved = sessions.save(session);
        log.info("Created merge session id={} repository={} user={}",
                saved.getId(), source.fullName(), user.getId());
        return saved;
    }

    /** Every session this user owns, newest first. */
    @Transactional(readOnly = true)
    public List<MergeSession> listFor(User user) {
        return sessions.findOwnedBy(user.getId());
    }

    /**
     * One session, readable only by the account that created it.
     *
     * <p>A session belonging to someone else is a 403 rather than a 404: the id
     * is an unguessable UUID, so confirming it exists reveals nothing, and the
     * clearer answer is easier to debug.
     */
    @Transactional(readOnly = true)
    public MergeSession requireOwned(User user, String id) {
        UUID sessionId;
        try {
            sessionId = UUID.fromString(id);
        } catch (IllegalArgumentException malformed) {
            throw NotFoundException.mergeSession();
        }
        MergeSession session = sessions.findByIdWithRepository(sessionId)
                .orElseThrow(NotFoundException::mergeSession);
        if (!session.getUser().getId().equals(user.getId())) {
            log.warn("Blocked cross-account merge session read session={} by user={}",
                    sessionId, user.getId());
            throw ForbiddenException.notYourMergeSession();
        }
        return session;
    }

    /** Dashboard counters, all derived from rows that actually exist. */
    @Transactional(readOnly = true)
    public MergeSessionStatsResponse statsFor(User user) {
        UUID userId = user.getId();
        long total = sessions.countByUserId(userId);
        long completed = sessions.countByUserIdAndStatus(userId, MergeSessionStatus.COMPLETED);
        long failed = sessions.countByUserIdAndStatus(userId, MergeSessionStatus.FAILED);
        return new MergeSessionStatsResponse(
                total,
                Math.max(0, total - completed - failed),
                completed,
                sessions.sumResolvedConflicts(userId));
    }

    private void requireBranch(String branch, Set<String> available, String fullName) {
        if (!available.contains(branch)) {
            throw NotFoundException.branch(branch, fullName);
        }
    }
}
