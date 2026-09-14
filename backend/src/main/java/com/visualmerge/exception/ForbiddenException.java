package com.visualmerge.exception;

import org.springframework.http.HttpStatus;

/** The caller is authenticated but is not allowed to touch this resource. */
public class ForbiddenException extends ApiException {

    public ForbiddenException(String code, String message) {
        super(HttpStatus.FORBIDDEN, code, message);
    }

    public static ForbiddenException notYourMergeSession() {
        return new ForbiddenException(
                "MERGE_SESSION_FORBIDDEN", "This merge session belongs to another account.");
    }

    public static ForbiddenException repositoryAccess(String fullName) {
        return new ForbiddenException(
                "REPOSITORY_FORBIDDEN",
                "Your GitHub account does not have access to %s.".formatted(fullName));
    }
}
