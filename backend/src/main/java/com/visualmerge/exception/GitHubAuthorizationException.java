package com.visualmerge.exception;

import org.springframework.http.HttpStatus;

/**
 * The session exists but the GitHub authorization behind it is gone or was
 * revoked, so the user has to sign in again.
 */
public class GitHubAuthorizationException extends ApiException {

    public GitHubAuthorizationException(String message) {
        super(HttpStatus.UNAUTHORIZED, "GITHUB_AUTHORIZATION_REQUIRED", message);
    }

    public static GitHubAuthorizationException missing() {
        return new GitHubAuthorizationException(
                "Your GitHub authorization is no longer valid. Sign in with GitHub again.");
    }
}
