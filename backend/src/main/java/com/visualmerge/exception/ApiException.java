package com.visualmerge.exception;

import org.springframework.http.HttpStatus;

/**
 * Base for failures that are safe to describe to the client.
 *
 * <p>Every subclass carries a stable machine-readable {@code code} alongside a
 * message already written for a person, so the frontend can branch on the code
 * and still have something useful to display.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    protected ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    protected ApiException(HttpStatus status, String code, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.code = code;
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }
}
