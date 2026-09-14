package com.visualmerge.exception;

import org.springframework.http.HttpStatus;

/**
 * The request is well-formed but asks for something that cannot be done —
 * for example comparing a branch with itself.
 */
public class InvalidRequestException extends ApiException {

    public InvalidRequestException(String code, String message) {
        super(HttpStatus.CONFLICT, code, message);
    }

    public static InvalidRequestException identicalBranches(String branch) {
        return new InvalidRequestException(
                "INVALID_BRANCH_SELECTION",
                "Branch A and Branch B are both \"%s\". Pick two different branches to compare."
                        .formatted(branch));
    }
}
