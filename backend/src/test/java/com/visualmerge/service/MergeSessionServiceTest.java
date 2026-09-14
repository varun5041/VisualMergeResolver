package com.visualmerge.service;

import com.visualmerge.dto.CreateMergeSessionRequest;
import com.visualmerge.dto.GitHubBranchResponse;
import com.visualmerge.dto.GitHubRepositoryResponse;
import com.visualmerge.exception.ForbiddenException;
import com.visualmerge.exception.InvalidRequestException;
import com.visualmerge.exception.NotFoundException;
import com.visualmerge.model.MergeSession;
import com.visualmerge.model.MergeSessionStatus;
import com.visualmerge.model.Repository;
import com.visualmerge.model.User;
import com.visualmerge.repository.MergeSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Creating a session validates everything against GitHub first, and reading one
 * is restricted to the account that created it.
 */
class MergeSessionServiceTest {

    private static final String TOKEN = "gho_testtoken";

    private MergeSessionRepository sessions;
    private RepositoryCatalogService catalog;
    private GitHubService gitHub;
    private MergeSessionService service;

    private User ada;

    @BeforeEach
    void setUp() {
        sessions = mock(MergeSessionRepository.class);
        catalog = mock(RepositoryCatalogService.class);
        gitHub = mock(GitHubService.class);
        service = new MergeSessionService(sessions, catalog, gitHub);

        ada = user("Ada");

        when(sessions.save(any(MergeSession.class))).thenAnswer(invocation -> {
            MergeSession session = invocation.getArgument(0);
            session.setId(UUID.randomUUID());
            return session;
        });
        when(catalog.remember(any(User.class), any(GitHubRepositoryResponse.class)))
                .thenAnswer(invocation -> repository(invocation.getArgument(1)));
    }

    // ------------------------------------------------------------------
    // Creating
    // ------------------------------------------------------------------

    @Test
    void createsASessionWhenTheRepositoryAndAllThreeBranchesExist() {
        givenRepositoryWithBranches("acme", "site", "main", "feature/nav", "feature/cards");

        MergeSession session = service.create(
                ada, TOKEN, request("acme", "site", "main", "feature/nav", "feature/cards"));

        assertThat(session.getId()).isNotNull();
        assertThat(session.getUser()).isSameAs(ada);
        assertThat(session.getStatus()).isEqualTo(MergeSessionStatus.CREATED);
        assertThat(session.getBaseBranch()).isEqualTo("main");
        assertThat(session.getBranchA()).isEqualTo("feature/nav");
        assertThat(session.getBranchB()).isEqualTo("feature/cards");
        // Nothing has been compared yet, so the count is absent rather than 0.
        assertThat(session.getConflictsCount()).isNull();
    }

    @Test
    void rejectsComparingABranchWithItself() {
        givenRepositoryWithBranches("acme", "site", "main", "feature/nav");

        assertThatThrownBy(() -> service.create(
                        ada, TOKEN, request("acme", "site", "main", "feature/nav", "feature/nav")))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("feature/nav");

        verify(sessions, never()).save(any());
    }

    @Test
    void rejectsABranchThatIsNotOnGitHub() {
        givenRepositoryWithBranches("acme", "site", "main", "feature/nav");

        assertThatThrownBy(() -> service.create(
                        ada, TOKEN, request("acme", "site", "main", "feature/nav", "feature/ghost")))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("feature/ghost");

        verify(sessions, never()).save(any());
    }

    @Test
    void rejectsABaseBranchThatIsNotOnGitHub() {
        givenRepositoryWithBranches("acme", "site", "feature/nav", "feature/cards");

        assertThatThrownBy(() -> service.create(
                        ada, TOKEN, request("acme", "site", "develop", "feature/nav", "feature/cards")))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("develop");

        verify(sessions, never()).save(any());
    }

    @Test
    void rejectsARepositoryTheAccountCannotSee() {
        // GitHub answers 404 for repositories a token may not read, so this is
        // both the existence check and the access check.
        when(gitHub.getRepository(anyString(), anyString(), anyString()))
                .thenThrow(new NotFoundException("GITHUB_NOT_FOUND", "no such thing"));

        assertThatThrownBy(() -> service.create(
                        ada, TOKEN, request("someone-else", "private-app", "main", "a", "b")))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("someone-else/private-app");

        verify(sessions, never()).save(any());
    }

    @Test
    void trimsSurroundingWhitespaceBeforeValidating() {
        givenRepositoryWithBranches("acme", "site", "main", "feature/nav", "feature/cards");

        MergeSession session = service.create(
                ada, TOKEN, request(" acme ", " site ", " main ", " feature/nav ", " feature/cards "));

        assertThat(session.getBaseBranch()).isEqualTo("main");
        assertThat(session.getBranchA()).isEqualTo("feature/nav");
    }

    // ------------------------------------------------------------------
    // Reading
    // ------------------------------------------------------------------

    @Test
    void returnsASessionToTheAccountThatOwnsIt() {
        MergeSession owned = storedSession(ada);

        assertThat(service.requireOwned(ada, owned.getId().toString())).isSameAs(owned);
    }

    @Test
    void refusesToReturnAnotherAccountsSession() {
        MergeSession adasSession = storedSession(ada);
        User mallory = user("Mallory");

        assertThatThrownBy(() -> service.requireOwned(mallory, adasSession.getId().toString()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void reportsAMissingSessionAsNotFound() {
        UUID unknown = UUID.randomUUID();
        when(sessions.findByIdWithRepository(unknown)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.requireOwned(ada, unknown.toString()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void treatsAnIdThatIsNotAUuidAsNotFoundRatherThanAnError() {
        assertThatThrownBy(() -> service.requireOwned(ada, "session-1"))
                .isInstanceOf(NotFoundException.class);
    }

    // ------------------------------------------------------------------
    // Stats
    // ------------------------------------------------------------------

    @Test
    void reportsZeroesForAnAccountThatHasDoneNothingYet() {
        when(sessions.countByUserId(ada.getId())).thenReturn(0L);
        when(sessions.countByUserIdAndStatus(any(), any())).thenReturn(0L);
        when(sessions.sumResolvedConflicts(ada.getId())).thenReturn(0L);

        var stats = service.statsFor(ada);

        assertThat(stats.totalSessions()).isZero();
        assertThat(stats.activeSessions()).isZero();
        assertThat(stats.completedMerges()).isZero();
        assertThat(stats.conflictsResolved()).isZero();
    }

    @Test
    void countsEverythingThatIsNeitherCompletedNorFailedAsActive() {
        when(sessions.countByUserId(ada.getId())).thenReturn(7L);
        when(sessions.countByUserIdAndStatus(ada.getId(), MergeSessionStatus.COMPLETED))
                .thenReturn(3L);
        when(sessions.countByUserIdAndStatus(ada.getId(), MergeSessionStatus.FAILED)).thenReturn(1L);
        when(sessions.sumResolvedConflicts(ada.getId())).thenReturn(11L);

        var stats = service.statsFor(ada);

        assertThat(stats.totalSessions()).isEqualTo(7);
        assertThat(stats.activeSessions()).isEqualTo(3);
        assertThat(stats.completedMerges()).isEqualTo(3);
        assertThat(stats.conflictsResolved()).isEqualTo(11);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private void givenRepositoryWithBranches(
            String owner, String name, String... branches) {
        when(gitHub.getRepository(TOKEN, owner, name))
                .thenReturn(new GitHubRepositoryResponse(
                        1234L,
                        name,
                        owner + "/" + name,
                        owner,
                        false,
                        branches.length > 0 ? branches[0] : null,
                        "https://github.com/" + owner + "/" + name,
                        null,
                        "TypeScript",
                        "2026-09-14T10:00:00Z"));
        when(gitHub.listBranches(TOKEN, owner, name))
                .thenReturn(List.of(branches).stream()
                        .map(branch -> new GitHubBranchResponse(branch, false, "abc123"))
                        .toList());
    }

    private MergeSession storedSession(User owner) {
        MergeSession session = new MergeSession();
        session.setId(UUID.randomUUID());
        session.setUser(owner);
        session.setRepository(new Repository());
        session.setBaseBranch("main");
        session.setBranchA("feature/nav");
        session.setBranchB("feature/cards");
        session.setStatus(MergeSessionStatus.CREATED);
        when(sessions.findByIdWithRepository(session.getId())).thenReturn(Optional.of(session));
        return session;
    }

    private static User user(String name) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName(name);
        user.setGithubId(name.toLowerCase());
        return user;
    }

    private static Repository repository(GitHubRepositoryResponse source) {
        Repository repository = new Repository();
        repository.setId(UUID.randomUUID());
        repository.setGithubRepositoryId(source.id());
        repository.setOwner(source.owner());
        repository.setName(source.name());
        repository.setFullName(source.fullName());
        return repository;
    }

    private static CreateMergeSessionRequest request(
            String owner, String repository, String base, String branchA, String branchB) {
        return new CreateMergeSessionRequest(owner, repository, base, branchA, branchB);
    }
}
