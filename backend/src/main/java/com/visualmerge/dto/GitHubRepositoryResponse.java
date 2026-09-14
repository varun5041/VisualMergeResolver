package com.visualmerge.dto;

/**
 * A repository exactly as GitHub reports it. Nothing here is stored or
 * invented — if a field is missing on GitHub, it is null here too.
 */
public record GitHubRepositoryResponse(
        Long id,
        String name,
        String fullName,
        String owner,
        boolean isPrivate,
        String defaultBranch,
        String htmlUrl,
        String description,
        String language,
        String updatedAt) {
}
