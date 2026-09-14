package com.visualmerge.dto;

/** Result of a validation-only check (no clone performed). */
public record ValidateRepositoryResponse(
        boolean valid,
        String owner,
        String name,
        String fullName,
        String webUrl,
        int branchCount
) {}
