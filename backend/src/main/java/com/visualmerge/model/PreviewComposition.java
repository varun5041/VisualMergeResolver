package com.visualmerge.model;

/**
 * Tells the frontend which variant of each running component to render in the
 * merged browser preview. Values: BRANCH_A, BRANCH_B, MERGED.
 */
public record PreviewComposition(
        String navbar,
        String hero,
        String footer
) {}
