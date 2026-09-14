package com.visualmerge.service;

import com.visualmerge.config.WorkspaceProperties;
import com.visualmerge.git.GitOperationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The workspace is the safety boundary: everything happens inside it and
 * nothing outside it is ever created or deleted.
 */
class WorkspaceServiceTest {

    @TempDir
    Path root;

    private WorkspaceService workspaceService;

    @BeforeEach
    void setUp() throws IOException {
        WorkspaceProperties properties = new WorkspaceProperties();
        properties.setRoot(root.toString());
        properties.setMaxRepositorySizeMb(1);
        properties.setSessionTtlMinutes(60);
        properties.setCleanupOnShutdown(false);
        workspaceService = new WorkspaceService(properties);
    }

    @Test
    void createsAnIsolatedDirectoryPerSession() {
        String first = workspaceService.createSession();
        String second = workspaceService.createSession();

        assertThat(first).isNotEqualTo(second);
        assertThat(workspaceService.repositoryPath(first)).exists().isDirectory();
        assertThat(workspaceService.repositoryPath(second)).exists().isDirectory();
        assertThat(workspaceService.repositoryPath(first))
                .isNotEqualTo(workspaceService.repositoryPath(second));
    }

    @Test
    void placesRepositoriesUnderTheConfiguredRootOnly() {
        String sessionId = workspaceService.createSession();

        Path repository = workspaceService.repositoryPath(sessionId);

        assertThat(repository.normalize()).startsWith(root.normalize());
        assertThat(repository.getFileName().toString()).isEqualTo("repository");
        assertThat(repository.getParent().getFileName().toString()).startsWith("session-");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "../escape",
            "session-../../escape",
            "../../Windows/System32",
            "session-x/../../..",
            "not-a-session",
            "session-",
            "",
    })
    void refusesSessionIdsThatCouldEscapeTheWorkspace(String hostileId) {
        assertThatThrownBy(() -> workspaceService.sessionPath(hostileId))
                .isInstanceOf(GitOperationException.class)
                .satisfies(e -> assertThat(((GitOperationException) e).code())
                        .isEqualTo(GitOperationException.Code.WORKSPACE_ERROR));
    }

    @Test
    void refusesANullSessionId() {
        assertThatThrownBy(() -> workspaceService.sessionPath(null))
                .isInstanceOf(GitOperationException.class);
    }

    @Test
    void measuresSessionSize() throws IOException {
        String sessionId = workspaceService.createSession();
        Files.writeString(workspaceService.repositoryPath(sessionId).resolve("blob.bin"),
                "x".repeat(4096));

        assertThat(workspaceService.sizeKb(sessionId)).isGreaterThanOrEqualTo(4);
        assertThat(workspaceService.maxSizeKb()).isEqualTo(1024);
    }

    @Test
    void deletesOnlyTheRequestedSession() throws IOException {
        String keep = workspaceService.createSession();
        String remove = workspaceService.createSession();
        Files.writeString(workspaceService.repositoryPath(keep).resolve("keep.txt"), "keep");
        Files.writeString(workspaceService.repositoryPath(remove).resolve("bye.txt"), "bye");

        workspaceService.deleteSession(remove);

        assertThat(workspaceService.sessionPath(remove)).doesNotExist();
        assertThat(workspaceService.sessionPath(keep)).exists();
        assertThat(root).exists();
    }

    @Test
    void ignoresDeletionOfAnUnknownOrHostileSession() throws IOException {
        Path outsider = root.getParent().resolve("outside-the-workspace.txt");
        Files.writeString(outsider, "must survive");

        workspaceService.deleteSession("../outside-the-workspace.txt");
        workspaceService.deleteSession("session-deadbeefdeadbeef");

        assertThat(outsider).exists();
        Files.deleteIfExists(outsider);
    }

    @Test
    void sweepsSessionsOlderThanTheTtlAndKeepsFreshOnes() throws IOException {
        String stale = workspaceService.createSession();
        String fresh = workspaceService.createSession();
        Files.setLastModifiedTime(workspaceService.sessionPath(stale),
                java.nio.file.attribute.FileTime.fromMillis(
                        System.currentTimeMillis() - (90L * 60_000L)));

        int removed = workspaceService.cleanupStaleSessions();

        assertThat(removed).isEqualTo(1);
        assertThat(workspaceService.sessionPath(stale)).doesNotExist();
        assertThat(workspaceService.sessionPath(fresh)).exists();
    }

    @Test
    void createsTheRootWhenItDoesNotExistYet() throws IOException {
        Path missing = root.resolve("nested/deeper/workspaces");
        WorkspaceProperties properties = new WorkspaceProperties();
        properties.setRoot(missing.toString());

        new WorkspaceService(properties);

        assertThat(missing).exists().isDirectory();
    }
}
