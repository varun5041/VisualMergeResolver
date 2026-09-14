package com.visualmerge.model;

public record CompatibleChange(
        String id,
        String title,
        String component,
        String status,
        String description,
        String filePath
) {}
