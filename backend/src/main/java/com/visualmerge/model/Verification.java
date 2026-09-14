package com.visualmerge.model;

import java.util.List;

public record Verification(
        List<VerificationStep> steps,
        List<VerificationCheck> checks,
        String verdict
) {}
