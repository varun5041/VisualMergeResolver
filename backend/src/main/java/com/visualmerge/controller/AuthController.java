package com.visualmerge.controller;

import com.visualmerge.dto.UserResponse;
import com.visualmerge.security.CurrentUser;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in VisualMerge account. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CurrentUser currentUser;

    public AuthController(CurrentUser currentUser) {
        this.currentUser = currentUser;
    }

    /**
     * The authenticated user, straight from MySQL.
     *
     * <p>This is the only source the frontend has for the current identity —
     * nothing about the user is hardcoded there.
     */
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from(currentUser.require(authentication));
    }
}
