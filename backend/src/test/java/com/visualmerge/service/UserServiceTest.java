package com.visualmerge.service;

import com.visualmerge.model.User;
import com.visualmerge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * The identity contract: one GitHub account is one VisualMerge user, forever.
 *
 * <p>The repository mock is backed by a real map, so "did a second row get
 * written?" is answered by counting rows rather than by asserting on calls.
 */
class UserServiceTest {

    private Map<UUID, User> rows;
    private UserService service;

    @BeforeEach
    void setUp() {
        rows = new LinkedHashMap<>();
        UserRepository repository = mock(UserRepository.class);

        when(repository.findByGithubId(anyString())).thenAnswer(invocation -> {
            String githubId = invocation.getArgument(0);
            return rows.values().stream()
                    .filter(user -> githubId.equals(user.getGithubId()))
                    .findFirst();
        });
        when(repository.findByEmail(anyString())).thenAnswer(invocation -> {
            String email = invocation.getArgument(0);
            return rows.values().stream()
                    .filter(user -> email.equals(user.getEmail()))
                    .findFirst();
        });
        when(repository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getId() == null) {
                user.setId(UUID.randomUUID());
            }
            rows.put(user.getId(), user);
            return user;
        });

        service = new UserService(repository);
    }

    @Test
    void createsTheAccountOnFirstGitHubSignIn() {
        User created = service.upsertFromGitHub(
                "4815162342", "ada", "Ada Okonkwo", "ada@example.com", "https://avatars/ada.png");

        assertThat(rows).hasSize(1);
        assertThat(created.getGithubId()).isEqualTo("4815162342");
        assertThat(created.getGithubUsername()).isEqualTo("ada");
        assertThat(created.getName()).isEqualTo("Ada Okonkwo");
        assertThat(created.getAvatarUrl()).isEqualTo("https://avatars/ada.png");
        assertThat(created.isGithubConnected()).isTrue();
    }

    @Test
    void signingInAgainUpdatesTheSameRowInsteadOfCreatingASecond() {
        User first = service.upsertFromGitHub("4815162342", "ada", "Ada", "ada@example.com", null);
        User second = service.upsertFromGitHub("4815162342", "ada", "Ada", "ada@example.com", null);

        assertThat(rows).hasSize(1);
        assertThat(second.getId()).isEqualTo(first.getId());
    }

    @Test
    void aRenamedGitHubAccountKeepsItsVisualMergeUser() {
        // Username and email both change. The numeric id does not, and that is
        // the whole reason it is the identity.
        User before = service.upsertFromGitHub("4815162342", "ada", "Ada", "ada@example.com", null);
        User after = service.upsertFromGitHub(
                "4815162342", "ada-o", "A. Okonkwo", "ada@work.example.com", null);

        assertThat(rows).hasSize(1);
        assertThat(after.getId()).isEqualTo(before.getId());
        assertThat(after.getGithubUsername()).isEqualTo("ada-o");
        assertThat(after.getEmail()).isEqualTo("ada@work.example.com");
    }

    @Test
    void twoDifferentGitHubAccountsGetTwoUsers() {
        service.upsertFromGitHub("1", "ada", "Ada", "ada@example.com", null);
        service.upsertFromGitHub("2", "kwame", "Kwame", "kwame@example.com", null);

        assertThat(rows).hasSize(2);
    }

    @Test
    void signsInAnAccountThatSharesNothingButAHiddenEmail() {
        // GitHub hides the address, so both sign-ins arrive with a null email.
        service.upsertFromGitHub("1", "ada", "Ada", null, null);
        service.upsertFromGitHub("2", "kwame", "Kwame", null, null);

        assertThat(rows).hasSize(2);
    }

    @Test
    void adoptsAnAccountThatPredatesGitHubIdentityInsteadOfDuplicatingIt() {
        // Exactly the shape of the row that already existed before github_id:
        // a name and an email, and no GitHub identity.
        User legacy = new User();
        legacy.setId(UUID.randomUUID());
        legacy.setName("Ada Okonkwo");
        legacy.setEmail("ada@example.com");
        rows.put(legacy.getId(), legacy);

        User adopted = service.upsertFromGitHub(
                "4815162342", "ada", "Ada Okonkwo", "ada@example.com", null);

        assertThat(rows).hasSize(1);
        assertThat(adopted.getId()).isEqualTo(legacy.getId());
        assertThat(adopted.getGithubId()).isEqualTo("4815162342");
        assertThat(adopted.isGithubConnected()).isTrue();
    }

    @Test
    void doesNotTakeOverAnAccountThatAlreadyBelongsToAnotherGitHubUser() {
        service.upsertFromGitHub("111", "ada", "Ada", "shared@example.com", null);

        // A different GitHub account reporting the same address gets its own
        // row. Adoption only ever applies to a row with no GitHub identity.
        service.upsertFromGitHub("222", "mallory", "Mallory", "shared@example.com", null);

        assertThat(rows).hasSize(2);
        assertThat(rows.values())
                .extracting(User::getGithubId)
                .containsExactlyInAnyOrder("111", "222");
    }

    @Test
    void rejectsASignInThatCarriesNoGitHubId() {
        assertThatThrownBy(() -> service.upsertFromGitHub(null, "ada", "Ada", "a@example.com", null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(rows).isEmpty();
    }

    @Test
    void toleratesAGitHubProfileWithNoNameAndNoEmail() {
        User created = service.upsertFromGitHub("9", "quiet", null, null, null);

        assertThat(rows).hasSize(1);
        assertThat(created.getName()).isNull();
        assertThat(created.getEmail()).isNull();
        // Still has something to show in the UI.
        assertThat(created.displayName()).isEqualTo("quiet");
    }
}
