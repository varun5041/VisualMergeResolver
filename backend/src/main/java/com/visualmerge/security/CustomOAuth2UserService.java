package com.visualmerge.security;

import com.visualmerge.service.UserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Runs on every GitHub sign-in, after GitHub has confirmed the identity.
 *
 * <p>Its whole job is to make sure the GitHub account has a matching row in
 * MySQL before the session is established. Finding, creating and updating that
 * row is {@link UserService}'s concern; this class only translates GitHub's
 * attributes into the call.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // GitHub's numeric id arrives as a number, so it is normalised to text
        // rather than read with getAttribute(), which would fail the cast.
        Object rawId = oAuth2User.getAttributes().get("id");
        String githubId = rawId == null ? null : String.valueOf(rawId);
        String login = attribute(oAuth2User, "login");

        userService.upsertFromGitHub(
                githubId,
                login,
                attribute(oAuth2User, "name"),
                attribute(oAuth2User, "email"),
                attribute(oAuth2User, "avatar_url"));

        return oAuth2User;
    }

    /** Reads a string attribute, treating blanks as absent. */
    private String attribute(OAuth2User user, String name) {
        Object value = user.getAttributes().get(name);
        if (!(value instanceof String text) || text.isBlank()) {
            return null;
        }
        return text;
    }
}
