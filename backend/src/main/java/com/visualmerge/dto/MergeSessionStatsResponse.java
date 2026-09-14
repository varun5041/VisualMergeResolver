package com.visualmerge.dto;

/**
 * Dashboard counters. Every number is a real count from the database — when
 * nothing has happened yet, they are all zero.
 */
public record MergeSessionStatsResponse(
        long totalSessions,
        long activeSessions,
        long completedMerges,
        long conflictsResolved) {
}
