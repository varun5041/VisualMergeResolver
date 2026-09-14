package com.visualmerge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** User-supplied repository URL. Validated properly in RepositoryUrl. */
public record ConnectRepositoryRequest(
        @NotBlank(message = "is required") @Size(max = 300, message = "is too long") String url
) {}
