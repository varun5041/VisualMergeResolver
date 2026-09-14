package com.visualmerge.model;

public record Project(
        String id,
        String name,
        String repository,
        String description,
        String language,
        String baseBranch,
        Branch branchA,
        Branch branchB,
        String updatedAt
) {}
