package com.visualmerge.security;

import com.visualmerge.exception.GitHubAuthorizationException;
import com.visualmerge.model.User;
import com.visualmerge.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Resolves the signed-in browser session into a VisualMerge user and, when a
 * call needs it, the GitHub access token behind that session.
 *
 * <p>The token is read from Spring Security's server-side authorized-client
 * store on demand. It is never written to the database, never put in a
 * response body, and never reaches the browser.
 */
@Component
public class CurrentUser {

    private final UserRepository userRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public CurrentUser(
            UserRepository userRepository,
            OAuth2AuthorizedClientService authorizedClientService) {
        this.userRepository = userRepository;
        this.authorizedClientService = authorizedClientService;
    }

    /**
     * The VisualMerge user for this session.
     *
     * @throws GitHubAuthorizationException when the session is not a GitHub
     *     login, or its user row has since disappeared
     */
    public User require(Authentication authentication) {
        String githubId = githubIdOf(authentication);
        return userRepository.findByGithubId(githubId)
                .orElseThrow(GitHubAuthorizationException::missing);
    }

    /**
     * The GitHub access token for this session.
     *
     * <p>Authorized clients are held in memory, so a backend restart drops them
     * and the user is asked to sign in again rather than being shown stale data.
     */
    public String requireAccessToken(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            throw GitHubAuthorizationException.missing();
        }
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName());
        if (client == null || client.getAccessToken() == null) {
            throw GitHubAuthorizationException.missing();
        }
        return client.getAccessToken().getTokenValue();
    }

    /** GitHub's numeric user id, which is the principal name for this provider. */
    private String githubIdOf(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            throw GitHubAuthorizationException.missing();
        }
        String name = oauthToken.getName();
        if (name == null || name.isBlank()) {
            throw GitHubAuthorizationException.missing();
        }
        return name;
    }
}
