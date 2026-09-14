package com.visualmerge.model;

import java.util.List;

public record Conflict(
        String id,
        String title,
        String component,
        String type,
        String severity,
        String status,
        String description,
        String filePath,
        List<String> branchAChanges,
        List<String> branchBChanges,
        AiAnalysis analysis,
        CodeDiff codeDiff,
        String defaultInstruction
) {}
