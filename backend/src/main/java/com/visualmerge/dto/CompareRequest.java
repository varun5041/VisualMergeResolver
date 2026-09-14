package com.visualmerge.dto;

import jakarta.validation.constraints.NotBlank;

public record CompareRequest(
        @NotBlank String projectId,
        String baseBranch,
        String branchA,
        String branchB
) {}
