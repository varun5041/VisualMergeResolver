package com.visualmerge.model;

/**
 * Lifecycle of a merge session.
 *
 * <p>Only {@link #CREATED} is reachable today — the comparison engine that
 * drives the rest is the next milestone. The whole vocabulary is defined up
 * front so the persisted value never becomes an ad-hoc string.
 */
public enum MergeSessionStatus {
    CREATED,
    FETCHING,
    COMPARING,
    CONFLICTS_FOUND,
    NO_CONFLICTS,
    RESOLVING,
    VERIFYING,
    COMPLETED,
    FAILED;

    /** True once the session has finished successfully. */
    public boolean isCompleted() {
        return this == COMPLETED;
    }
}
