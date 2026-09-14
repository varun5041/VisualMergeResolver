package com.visualmerge.git;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RepositoryUrlTest {

    @Test
    void parsesACanonicalGitHubUrl() {
        RepositoryUrl url = RepositoryUrl.parse("https://github.com/octocat/Hello-World");

        assertThat(url.owner()).isEqualTo("octocat");
        assertThat(url.name()).isEqualTo("Hello-World");
        assertThat(url.fullName()).isEqualTo("octocat/Hello-World");
        assertThat(url.cloneUrl()).isEqualTo("https://github.com/octocat/Hello-World.git");
        assertThat(url.webUrl()).isEqualTo("https://github.com/octocat/Hello-World");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://github.com/octocat/Hello-World.git",
            "https://github.com/octocat/Hello-World/",
            "https://www.github.com/octocat/Hello-World",
            "  https://github.com/octocat/Hello-World  ",
            "github.com/octocat/Hello-World",
    })
    void acceptsCommonVariations(String input) {
        assertThat(RepositoryUrl.parse(input).fullName()).isEqualTo("octocat/Hello-World");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://gitlab.com/octocat/Hello-World",
            "https://githubb.com/octocat/Hello-World",
            "https://github.com.evil.example/octocat/Hello-World",
    })
    void rejectsNonGitHubHosts(String input) {
        assertThatThrownBy(() -> RepositoryUrl.parse(input))
                .isInstanceOf(GitOperationException.class)
                .satisfies(e -> assertThat(((GitOperationException) e).code())
                        .isEqualTo(GitOperationException.Code.INVALID_URL));
    }

    @Test
    void rejectsEmbeddedCredentialsSoTheyAreNeverStoredOrLogged() {
        assertThatThrownBy(() -> RepositoryUrl.parse("https://user:token@github.com/octocat/Hello-World"))
                .isInstanceOf(GitOperationException.class)
                .hasMessageContaining("Remove the credentials");
    }

    @Test
    void rejectsSshAndScpSyntax() {
        assertThatThrownBy(() -> RepositoryUrl.parse("git@github.com:octocat/Hello-World.git"))
                .hasMessageContaining("SSH URLs are not supported");
        assertThatThrownBy(() -> RepositoryUrl.parse("ssh://git@github.com/octocat/Hello-World"))
                .hasMessageContaining("SSH URLs are not supported");
    }

    @Test
    void rejectsNonHttpsSchemes() {
        assertThatThrownBy(() -> RepositoryUrl.parse("http://github.com/octocat/Hello-World"))
                .hasMessageContaining("Only https");
        assertThatThrownBy(() -> RepositoryUrl.parse("file:///etc/passwd"))
                .isInstanceOf(GitOperationException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://github.com/octocat/Hello-World/blob/main/README.md",
            "https://github.com/octocat/Hello-World/pull/42",
            "https://github.com/../../etc/passwd",
            "https://github.com/octocat/Hello-World/../../../secrets",
    })
    void rejectsAnythingBeyondOwnerAndRepository(String input) {
        assertThatThrownBy(() -> RepositoryUrl.parse(input))
                .isInstanceOf(GitOperationException.class);
    }

    @Test
    void rejectsIncompletePaths() {
        assertThatThrownBy(() -> RepositoryUrl.parse("https://github.com/octocat"))
                .hasMessageContaining("Include the owner and repository");
        assertThatThrownBy(() -> RepositoryUrl.parse("https://github.com/"))
                .isInstanceOf(GitOperationException.class);
    }

    @Test
    void rejectsBlankAndOversizedInput() {
        assertThatThrownBy(() -> RepositoryUrl.parse("   "))
                .hasMessageContaining("Enter a GitHub repository URL");
        assertThatThrownBy(() -> RepositoryUrl.parse("https://github.com/a/" + "x".repeat(400)))
                .isInstanceOf(GitOperationException.class);
    }

    @Test
    void rejectsPortsAndShellMetacharacters() {
        assertThatThrownBy(() -> RepositoryUrl.parse("https://github.com:8080/octocat/Hello-World"))
                .isInstanceOf(GitOperationException.class);
        assertThatThrownBy(() -> RepositoryUrl.parse("https://github.com/octocat/Hello;rm -rf /"))
                .isInstanceOf(GitOperationException.class);
        assertThatThrownBy(() -> RepositoryUrl.parse("https://github.com/octocat/$(whoami)"))
                .isInstanceOf(GitOperationException.class);
    }

    @Test
    void equalityIgnoresTheInputFormatting() {
        assertThat(RepositoryUrl.parse("https://github.com/octocat/Hello-World.git"))
                .isEqualTo(RepositoryUrl.parse("github.com/octocat/Hello-World"));
    }
}
