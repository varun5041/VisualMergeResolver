package com.visualmerge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One request to compare two branches of a repository against a base branch.
 *
 * <p>A session belongs to exactly one user and is only ever readable by that
 * user.
 */
@Entity
@Table(name = "merge_sessions")
public class MergeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;

    @Column(name = "base_branch", nullable = false)
    private String baseBranch;

    @Column(name = "branch_a", nullable = false)
    private String branchA;

    @Column(name = "branch_b", nullable = false)
    private String branchB;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private MergeSessionStatus status = MergeSessionStatus.CREATED;

    /**
     * Filled in by the comparison engine. Null means "not compared yet" and is
     * deliberately different from 0, which means "compared, found nothing".
     */
    @Column(name = "conflicts_count")
    private Integer conflictsCount;

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Repository getRepository() {
        return repository;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
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

    public MergeSessionStatus getStatus() {
        return status;
    }

    public void setStatus(MergeSessionStatus status) {
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
