package com.visualmerge.dto;

/** A branch as GitHub reports it. */
public record GitHubBranchResponse(String name, boolean isProtected, String commitSha) {
}
