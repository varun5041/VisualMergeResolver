package com.visualmerge.dto;

import com.visualmerge.model.MergeSession;

/** A persisted merge session. */
public record MergeSessionResponse(
        String id,
        RepositorySummary repository,
        String baseBranch,
        String branchA,
        String branchB,
        String status,
        Integer conflictsCount,
        String createdAt,
        String updatedAt) {

    /** The repository snapshot stored with the session. */
    public record RepositorySummary(
            String id,
            Long githubRepositoryId,
            String owner,
            String name,
            String fullName,
            boolean isPrivate,
            String defaultBranch,
            String htmlUrl) {
    }

    public static MergeSessionResponse from(MergeSession session) {
        var repository = session.getRepository();
        return new MergeSessionResponse(
                session.getId().toString(),
                new RepositorySummary(
                        repository.getId().toString(),
                        repository.getGithubRepositoryId(),
                        repository.getOwner(),
                        repository.getName(),
                        repository.getFullName(),
                        repository.isPrivateRepository(),
                        repository.getDefaultBranch(),
                        repository.getHtmlUrl()),
                session.getBaseBranch(),
                session.getBranchA(),
                session.getBranchB(),
                session.getStatus().name(),
                session.getConflictsCount(),
                session.getCreatedAt() == null ? null : session.getCreatedAt().toString(),
                session.getUpdatedAt() == null ? null : session.getUpdatedAt().toString());
    }
}
