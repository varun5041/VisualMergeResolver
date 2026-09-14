package com.visualmerge.dto;

/**
 * A user-safe error. Carries a stable code the frontend can branch on and a
 * message written for a person — never a stack trace or a filesystem path.
 */
public record ApiErrorResponse(
        int status,
        String code,
        String message
) {}
