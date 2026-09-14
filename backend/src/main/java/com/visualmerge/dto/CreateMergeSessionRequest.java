package com.visualmerge.dto;

import jakarta.validation.constraints.NotBlank;

/** Everything needed to open a merge session, all of it verified against GitHub. */
public record CreateMergeSessionRequest(
        @NotBlank(message = "is required") String owner,
        @NotBlank(message = "is required") String repository,
        @NotBlank(message = "is required") String baseBranch,
        @NotBlank(message = "is required") String branchA,
        @NotBlank(message = "is required") String branchB) {
}
