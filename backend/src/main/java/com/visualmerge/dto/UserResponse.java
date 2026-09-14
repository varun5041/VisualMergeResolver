package com.visualmerge.dto;

import com.visualmerge.model.User;

/**
 * The authenticated VisualMerge user, as the frontend sees it.
 *
 * <p>Deliberately does not carry the GitHub access token or anything else the
 * browser has no business holding.
 */
public record UserResponse(
        String id,
        String githubId,
        String githubUsername,
        String name,
        String email,
        String avatarUrl,
        boolean githubConnected,
        String createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getGithubId(),
                user.getGithubUsername(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.isGithubConnected(),
                user.getCreatedAt() == null ? null : user.getCreatedAt().toString());
    }
}
