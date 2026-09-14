package com.visualmerge.model;

/** Optional secondary view — the raw conflict, kept out of the way of the visual UI. */
public record CodeDiff(
        String filePath,
        String language,
        String branchA,
        String branchB,
        String conflictMarkers
) {}
