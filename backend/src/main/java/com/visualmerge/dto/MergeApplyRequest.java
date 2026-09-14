package com.visualmerge.dto;

import jakarta.validation.constraints.NotBlank;

public record MergeApplyRequest(@NotBlank String planId) {}
