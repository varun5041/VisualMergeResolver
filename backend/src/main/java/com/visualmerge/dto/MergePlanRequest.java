package com.visualmerge.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * A request to plan a merge. Each resolution says how one conflict should be
 * settled; strategy is one of BRANCH_A, BRANCH_B or COMBINE. Conflicts left out
 * of the list fall back to the AI recommendation (COMBINE).
 */
public record MergePlanRequest(
        @NotBlank String comparisonId,
        List<Resolution> resolutions,
        String strategy,
        String instruction
) {
    public record Resolution(String conflictId, String strategy, String instruction) {}
}
