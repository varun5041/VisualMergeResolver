package com.visualmerge.model;

/**
 * A branch discovered by reading a cloned repository with JGit.
 *
 * <p>Used by the workspace layer. Branches shown in the product come from the
 * GitHub API instead, as {@link com.visualmerge.dto.GitHubBranchResponse}.
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
