package com.visualmerge.model;

import java.util.List;

public record MergeRequest(
        String id,
        int number,
        String title,
        String description,
        String sourceBranch,
        String targetBranch,
        String url,
        String state,
        int filesChanged,
        int additions,
        int deletions,
        List<Commit> commits,
        List<ChangedFile> files
) {}
