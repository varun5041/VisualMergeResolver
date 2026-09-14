package com.visualmerge.model;

import java.util.List;

public record AiAnalysis(
        String summary,
        List<String> branchA,
        List<String> branchB,
        String recommendation,
        String compatibility,
        int confidence
) {}
