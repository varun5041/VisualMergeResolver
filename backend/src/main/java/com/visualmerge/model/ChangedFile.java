package com.visualmerge.model;

public record ChangedFile(String path, String status, int additions, int deletions) {}
