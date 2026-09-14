package com.visualmerge.git;

import com.visualmerge.model.RepositoryBranch;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Ref;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Exercises real Git operations against a repository created in a temp
 * directory. Nothing here touches the network or any repository of the user's.
 */
class GitServiceTest {

    private static final GitService gitService = new GitService();

    @TempDir
    static Path fixtures;

    private static Path originPath;

    @BeforeAll
    static void createOriginRepository() throws Exception {
        originPath = fixtures.resolve("origin");
        Files.createDirectories(originPath);

        try (Git git = Git.init().setDirectory(originPath.toFile()).setInitialBranch("main").call()) {
            commit(git, originPath, "README.md", "# fixture\n", "chore: initial commit");

            git.checkout().setCreateBranch(true).setName("feature/navbar").call();
            commit(git, originPath, "src/Navbar.tsx", "export const Navbar = () => null;\n",
                    "feat(nav): add navbar");

            git.checkout().setName("main").call();
            git.checkout().setCreateBranch(true).setName("feature/theme").call();
            commit(git, originPath, "src/Theme.tsx", "export const theme = 'festival';\n",
                    "feat(theme): festival theme");

            git.checkout().setName("main").call();
        }
    }

    private static void commit(Git git, Path root, String relativePath, String content, String message)
            throws Exception {
        Path file = root.resolve(relativePath);
        Files.createDirectories(file.getParent());
        Files.writeString(file, content);
        git.add().addFilepattern(".").call();
        git.commit().setMessage(message)
                .setAuthor("Fixture", "fixture@example.invalid")
                .setSign(false)
                .call();
    }

    private Path cloneFixture(Path destination) throws Exception {
        Files.createDirectories(destination);
        gitService.cloneFrom(originPath.toUri().toString(), destination, 30);
        return destination;
    }

    @Test
    void clonesIntoTheGivenDirectoryAsABareRepository(@TempDir Path temp) throws Exception {
        Path clone = cloneFixture(temp.resolve("repository"));

        // A bare clone has no working tree: refs and objects only.
        assertThat(clone.resolve("HEAD")).exists();
        assertThat(clone.resolve("objects")).exists();
        assertThat(clone.resolve("README.md")).doesNotExist();
        assertThat(clone.resolve(".git")).doesNotExist();
    }

    @Test
    void discoversEveryBranchWithItsTipCommit(@TempDir Path temp) throws Exception {
        Path clone = cloneFixture(temp.resolve("repository"));

        List<RepositoryBranch> branches = gitService.listBranches(clone, "main");

        assertThat(branches).extracting(RepositoryBranch::name)
                .containsExactlyInAnyOrder("main", "feature/navbar", "feature/theme");

        RepositoryBranch navbar = branches.stream()
                .filter(branch -> branch.name().equals("feature/navbar"))
                .findFirst().orElseThrow();
        assertThat(navbar.commitMessage()).isEqualTo("feat(nav): add navbar");
        assertThat(navbar.author()).isEqualTo("Fixture");
        assertThat(navbar.shortCommitId()).hasSize(7);
        assertThat(navbar.commitId()).hasSize(40).startsWith(navbar.shortCommitId());
        assertThat(navbar.fullRef()).startsWith("refs/heads/");
        assertThat(navbar.isDefault()).isFalse();
    }

    @Test
    void marksTheDefaultBranchAndSortsItFirst(@TempDir Path temp) throws Exception {
        Path clone = cloneFixture(temp.resolve("repository"));

        List<RepositoryBranch> branches = gitService.listBranches(clone, "main");

        assertThat(branches.get(0).name()).isEqualTo("main");
        assertThat(branches.get(0).isDefault()).isTrue();
        assertThat(branches.stream().filter(RepositoryBranch::isDefault)).hasSize(1);
    }

    @Test
    void resolvesTheDefaultBranchFromTheClonedHead(@TempDir Path temp) throws Exception {
        Path clone = cloneFixture(temp.resolve("repository"));
        Collection<Ref> refs = List.of();

        assertThat(gitService.resolveDefaultBranch(clone, refs)).isEqualTo("main");
    }

    @Test
    void shortensRefNamesForLocalAndRemoteHeads() {
        assertThat(GitService.shortBranchName("refs/heads/feature/navbar")).isEqualTo("feature/navbar");
        assertThat(GitService.shortBranchName("refs/remotes/origin/feature/navbar"))
                .isEqualTo("feature/navbar");
        assertThat(GitService.shortBranchName("refs/heads/main")).isEqualTo("main");
    }

    @Test
    void doesNotModifyTheSourceRepository(@TempDir Path temp) throws Exception {
        long commitsBefore = countCommits(originPath);

        cloneFixture(temp.resolve("repository"));

        assertThat(countCommits(originPath)).isEqualTo(commitsBefore);
        // The fixture's working tree is still on main and still clean.
        try (Git git = Git.open(originPath.toFile())) {
            assertThat(git.getRepository().getBranch()).isEqualTo("main");
            assertThat(git.status().call().isClean()).isTrue();
        }
    }

    private long countCommits(Path repository) throws IOException {
        try (Git git = Git.open(repository.toFile())) {
            return java.util.stream.StreamSupport
                    .stream(gitLog(git).spliterator(), false)
                    .count();
        }
    }

    private Iterable<org.eclipse.jgit.revwalk.RevCommit> gitLog(Git git) {
        try {
            return git.log().all().call();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
