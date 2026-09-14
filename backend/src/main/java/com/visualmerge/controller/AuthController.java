package com.visualmerge.controller;

import com.visualmerge.model.User;
import com.visualmerge.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2User oAuth2User) {
        if (oAuth2User == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            email = oAuth2User.getAttribute("login") + "@users.noreply.github.com";
        }

        User dbUser = userRepository.findByEmail(email).orElse(null);

        if (dbUser == null) {
            return ResponseEntity.status(404).body("User not found in database");
        }

        // Return user data matching the frontend's User interface
        Map<String, Object> response = new HashMap<>();
        response.put("id", dbUser.getId().toString());
        response.put("name", dbUser.getName());
        response.put("email", dbUser.getEmail());
        response.put("githubConnected", dbUser.isGithubConnected());
        
        String avatarUrl = oAuth2User.getAttribute("avatar_url");
        if (avatarUrl != null) {
            response.put("avatarUrl", avatarUrl);
        }

        return ResponseEntity.ok(response);
    }
}
