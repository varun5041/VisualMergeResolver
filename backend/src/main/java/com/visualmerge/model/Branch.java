package com.visualmerge.model;

/** A branch in the mocked CauseKind repository. */
public record Branch(
        String name,
        String label,
        String author,
        int commits,
        String lastCommit,
        String updatedAt,
        String accent
) {}
