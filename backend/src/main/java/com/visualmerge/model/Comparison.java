package com.visualmerge.model;

import java.util.List;

public record Comparison(
        String id,
        String projectId,
        String baseBranch,
        String branchA,
        String branchB,
        String createdAt,
        int conflictCount,
        List<Conflict> conflicts,
        List<CompatibleChange> compatible,
        List<String> analysisSteps,
        int filesChanged,
        int additions,
        int deletions
) {}
