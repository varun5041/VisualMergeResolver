package com.visualmerge.exception;

import org.springframework.http.HttpStatus;

/**
 * GitHub itself failed or refused the call. Distinct from a VisualMerge bug,
 * so the UI can tell the user to retry rather than blaming their input.
 */
public class GitHubApiException extends ApiException {

    public GitHubApiException(String code, String message) {
        super(HttpStatus.BAD_GATEWAY, code, message);
    }

    public GitHubApiException(String code, String message, Throwable cause) {
        super(HttpStatus.BAD_GATEWAY, code, message, cause);
    }

    public static GitHubApiException unreachable(Throwable cause) {
        return new GitHubApiException(
                "GITHUB_UNREACHABLE",
                "VisualMerge could not reach GitHub. Please try again in a moment.",
                cause);
    }

    public static GitHubApiException rateLimited() {
        return new GitHubApiException(
                "GITHUB_RATE_LIMITED",
                "GitHub is rate-limiting this account. Please try again in a few minutes.");
    }
}
