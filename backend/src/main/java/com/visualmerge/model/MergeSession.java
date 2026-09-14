package com.visualmerge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "merge_sessions")
public class MergeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "repository_id", nullable = false)
    private String repositoryId; // e.g. "causekind/causekind-web"

    @Column(name = "base_branch", nullable = false)
    private String baseBranch;

    @Column(name = "branch_a", nullable = false)
    private String branchA;

    @Column(name = "branch_b", nullable = false)
    private String branchB;

    @Column(nullable = false)
    private String status; // 'draft', 'analyzing', 'ready-to-resolve', 'resolved'

    @Column(name = "conflicts_count")
    private Integer conflictsCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRepositoryId() {
        return repositoryId;
    }

    public void setRepositoryId(String repositoryId) {
        this.repositoryId = repositoryId;
    }

    public String getBaseBranch() {
        return baseBranch;
    }

    public void setBaseBranch(String baseBranch) {
        this.baseBranch = baseBranch;
    }

    public String getBranchA() {
        return branchA;
    }

    public void setBranchA(String branchA) {
        this.branchA = branchA;
    }

    public String getBranchB() {
        return branchB;
    }

    public void setBranchB(String branchB) {
        this.branchB = branchB;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getConflictsCount() {
        return conflictsCount;
    }

    public void setConflictsCount(Integer conflictsCount) {
        this.conflictsCount = conflictsCount;
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
}
