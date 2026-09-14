package com.visualmerge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A VisualMerge account.
 *
 * <p>Identity is the GitHub numeric user id, never the username: GitHub lets
 * people rename themselves, and the email can be hidden or changed. The same
 * GitHub account therefore always resolves to the same row here.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * The GitHub numeric user id, stored as text because GitHub documents it as
     * an opaque identifier. Unique, and null only for accounts created before
     * GitHub identity existed — those are adopted on their next login.
     */
    @Column(name = "github_id", unique = true, length = 64)
    private String githubId;

    @Column(name = "github_username")
    private String githubUsername;

    /** GitHub display name. Often absent, so never required. */
    @Column(name = "name")
    private String name;

    /** Absent when the account keeps its email private. */
    @Column(name = "email")
    private String email;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    /** Legacy column from the email/password prototype. Unused, kept nullable. */
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "github_connected", nullable = false)
    private boolean githubConnected = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getGithubId() {
        return githubId;
    }

    public void setGithubId(String githubId) {
        this.githubId = githubId;
    }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isGithubConnected() {
        return githubConnected;
    }

    public void setGithubConnected(boolean githubConnected) {
        this.githubConnected = githubConnected;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /** The best human label available for this account. */
    public String displayName() {
        if (name != null && !name.isBlank()) {
            return name;
        }
        return githubUsername;
    }
}
