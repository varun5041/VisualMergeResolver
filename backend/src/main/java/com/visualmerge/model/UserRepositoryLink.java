package com.visualmerge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Many-to-many link between users and the repositories they have worked with
 * in VisualMerge. One repository can be used by many users, and one user by
 * many repositories.
 *
 * <p><strong>This is not an access-control record.</strong> GitHub remains the
 * authority on who may read a repository, and every request re-checks there. A
 * row here only means "this account used this repository at some point", which
 * is what the product surface needs to show recent work.
 */
@Entity
@Table(name = "user_repositories")
public class UserRepositoryLink {

    @EmbeddedId
    private Key id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("repositoryId")
    @JoinColumn(name = "repository_id")
    private Repository repository;

    @Column(name = "linked_at", nullable = false)
    private LocalDateTime linkedAt;

    protected UserRepositoryLink() {
        // for JPA
    }

    public UserRepositoryLink(User user, Repository repository) {
        this.id = new Key(user.getId(), repository.getId());
        this.user = user;
        this.repository = repository;
        this.linkedAt = LocalDateTime.now();
    }

    public Key getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Repository getRepository() {
        return repository;
    }

    public LocalDateTime getLinkedAt() {
        return linkedAt;
    }

    @Embeddable
    public static class Key implements Serializable {

        @Column(name = "user_id")
        private UUID userId;

        @Column(name = "repository_id")
        private UUID repositoryId;

        protected Key() {
            // for JPA
        }

        public Key(UUID userId, UUID repositoryId) {
            this.userId = userId;
            this.repositoryId = repositoryId;
        }

        public UUID getUserId() {
            return userId;
        }

        public UUID getRepositoryId() {
            return repositoryId;
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof Key key)) {
                return false;
            }
            return Objects.equals(userId, key.userId)
                    && Objects.equals(repositoryId, key.repositoryId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, repositoryId);
        }
    }
}
