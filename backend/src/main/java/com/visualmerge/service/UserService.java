package com.visualmerge.service;

import com.visualmerge.model.User;
import com.visualmerge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Maps a GitHub account onto exactly one VisualMerge user.
 *
 * <p>The only database logic for identity lives here; the OAuth2 layer hands it
 * GitHub attributes and gets a persisted user back.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Finds or creates the user behind a GitHub identity, and refreshes the
     * profile fields that GitHub owns.
     *
     * <p>The lookup is by GitHub id, so signing in a second time updates the
     * same row instead of creating a duplicate — even if the person renamed
     * themselves or changed their email on GitHub since.
     *
     * @param githubId       GitHub's numeric user id: the stable identity
     * @param githubUsername current GitHub login, which may change over time
     */
    @Transactional
    public User upsertFromGitHub(
            String githubId,
            String githubUsername,
            String name,
            String email,
            String avatarUrl) {

        if (githubId == null || githubId.isBlank()) {
            throw new IllegalArgumentException("GitHub did not return a user id");
        }

        User user = userRepository.findByGithubId(githubId)
                .or(() -> adoptLegacyAccount(githubId, email))
                .orElseGet(User::new);

        boolean isNew = user.getId() == null;

        user.setGithubId(githubId);
        user.setGithubUsername(githubUsername);
        user.setName(name);
        user.setEmail(email);
        user.setAvatarUrl(avatarUrl);
        user.setGithubConnected(true);

        User saved = userRepository.save(user);
        log.info("GitHub sign-in {} user id={} githubId={}",
                isNew ? "created" : "updated", saved.getId(), githubId);
        return saved;
    }

    /**
     * Claims a row created before GitHub identity existed.
     *
     * <p>Without this, a returning user whose row predates {@code github_id}
     * would fail the email unique key on every login. Matching by email is only
     * safe here because the row has no GitHub identity yet — once adopted, the
     * GitHub id is what identifies them forever after.
     */
    private Optional<User> adoptLegacyAccount(String githubId, String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email)
                .filter(existing -> existing.getGithubId() == null)
                .map(existing -> {
                    log.info("Adopting pre-GitHub account id={} for githubId={}",
                            existing.getId(), githubId);
                    return existing;
                });
    }
}
