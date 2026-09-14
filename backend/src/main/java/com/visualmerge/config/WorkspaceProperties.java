package com.visualmerge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the isolated workspace that cloned repositories live in.
 */
@ConfigurationProperties(prefix = "visualmerge.workspace")
public class WorkspaceProperties {

    /** Root directory for all session workspaces. Never the application source tree. */
    private String root;

    private int cloneTimeoutSeconds = 120;

    private int maxRepositorySizeMb = 500;

    private int sessionTtlMinutes = 120;

    private boolean cleanupOnShutdown = true;

    public String getRoot() {
        return root;
    }

    public void setRoot(String root) {
        this.root = root;
    }

    public int getCloneTimeoutSeconds() {
        return cloneTimeoutSeconds;
    }

    public void setCloneTimeoutSeconds(int cloneTimeoutSeconds) {
        this.cloneTimeoutSeconds = cloneTimeoutSeconds;
    }

    public int getMaxRepositorySizeMb() {
        return maxRepositorySizeMb;
    }

    public void setMaxRepositorySizeMb(int maxRepositorySizeMb) {
        this.maxRepositorySizeMb = maxRepositorySizeMb;
    }

    public int getSessionTtlMinutes() {
        return sessionTtlMinutes;
    }

    public void setSessionTtlMinutes(int sessionTtlMinutes) {
        this.sessionTtlMinutes = sessionTtlMinutes;
    }

    public boolean isCleanupOnShutdown() {
        return cleanupOnShutdown;
    }

    public void setCleanupOnShutdown(boolean cleanupOnShutdown) {
        this.cleanupOnShutdown = cleanupOnShutdown;
    }
}
