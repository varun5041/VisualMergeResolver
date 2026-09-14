package com.visualmerge.model;

import java.util.List;

public record MergePlan(
        String id,
        String comparisonId,
        String projectId,
        String strategy,
        String strategyLabel,
        String instruction,
        List<String> conflictIds,
        int conflictsResolved,
        String summary,
        List<MergePlanItem> items,
        List<String> notes,
        PreviewComposition preview,
        String createdAt
) {}
