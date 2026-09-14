package com.visualmerge.model;

import java.util.List;

/**
 * Metadata for a connected repository.
 *
 * <p>Deliberately contains no filesystem path: the workspace location is held
 * internally by the repository service and never leaves the backend.
 */
public record GitRepository(
        String id,
        String owner,
        String name,
        String fullName,
        String webUrl,
        String defaultBranch,
        int branchCount,
        long sizeKb,
        String connectedAt,
        String state,
        List<RepositoryBranch> branches
) {
    public GitRepository withBranches(List<RepositoryBranch> discovered, String defaultBranchName) {
        return new GitRepository(
                id, owner, name, fullName, webUrl, defaultBranchName,
                discovered.size(), sizeKb, connectedAt, state, discovered);
    }

    public GitRepository withState(String newState) {
        return new GitRepository(
                id, owner, name, fullName, webUrl, defaultBranch,
                branchCount, sizeKb, connectedAt, newState, branches);
    }

    public GitRepository withSize(long kb) {
        return new GitRepository(
                id, owner, name, fullName, webUrl, defaultBranch,
                branchCount, kb, connectedAt, state, branches);
    }
}
