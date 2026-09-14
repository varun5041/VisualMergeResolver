package com.visualmerge.model;

/**
 * A real branch discovered in a cloned repository.
 *
 * <p>Distinct from {@link Branch}, which describes the mocked CauseKind demo.
 */
public record RepositoryBranch(
        String name,
        String fullRef,
        String commitId,
        String shortCommitId,
        String commitMessage,
        String author,
        String committedAt,
        boolean isDefault
) {}
