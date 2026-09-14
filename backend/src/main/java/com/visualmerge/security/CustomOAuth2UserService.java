package com.visualmerge.security;

import com.visualmerge.model.User;
import com.visualmerge.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String login = oAuth2User.getAttribute("login"); // GitHub username

        if (email == null) {
            // Some users hide their public email on GitHub
            email = login + "@users.noreply.github.com";
        }

        if (name == null || name.isEmpty()) {
            name = login;
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setGithubConnected(true);
            userRepository.save(newUser);
        } else {
            User existingUser = userOptional.get();
            if (!existingUser.isGithubConnected()) {
                existingUser.setGithubConnected(true);
                userRepository.save(existingUser);
            }
        }

        return oAuth2User;
    }
}
