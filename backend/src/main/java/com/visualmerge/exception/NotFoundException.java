package com.visualmerge.exception;

import org.springframework.http.HttpStatus;

/** The requested thing does not exist, or is indistinguishable from not existing. */
public class NotFoundException extends ApiException {

    public NotFoundException(String code, String message) {
        super(HttpStatus.NOT_FOUND, code, message);
    }

    public static NotFoundException repository(String owner, String name) {
        return new NotFoundException(
                "REPOSITORY_NOT_FOUND",
                "Repository %s/%s was not found, or your GitHub account cannot see it."
                        .formatted(owner, name));
    }

    public static NotFoundException branch(String branch, String fullName) {
        return new NotFoundException(
                "BRANCH_NOT_FOUND",
                "Branch \"%s\" does not exist in %s.".formatted(branch, fullName));
    }

    public static NotFoundException mergeSession() {
        return new NotFoundException("MERGE_SESSION_NOT_FOUND", "That merge session does not exist.");
    }
}
