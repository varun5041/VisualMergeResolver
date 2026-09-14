package com.visualmerge.model;

public record MergePlanItem(
        String id,
        String component,
        String feature,
        String source,
        String sourceBranch,
        String note
) {}
