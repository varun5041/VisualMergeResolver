package com.visualmerge.model;

public record MergeResult(
        String id,
        String planId,
        String projectId,
        String status,
        MergePlan plan,
        PreviewComposition preview,
        Verification verification,
        MergeRequest mergeRequest,
        String createdAt
) {}
