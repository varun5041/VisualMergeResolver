package com.visualmerge.repository;

import com.visualmerge.model.MergeSession;
import com.visualmerge.model.MergeSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MergeSessionRepository extends JpaRepository<MergeSession, UUID> {

    /**
     * Sessions owned by one user, newest first. The repository is fetched with
     * the session so the list endpoint does not issue one query per row.
     */
    @Query("""
            select s from MergeSession s
              join fetch s.repository
             where s.user.id = :userId
             order by s.updatedAt desc
            """)
    List<MergeSession> findOwnedBy(@Param("userId") UUID userId);

    /**
     * Loads a session together with its repository. Ownership is checked by the
     * service, not here, so the caller can tell "not found" from "not yours".
     */
    @Query("""
            select s from MergeSession s
              join fetch s.repository
              join fetch s.user
             where s.id = :id
            """)
    Optional<MergeSession> findByIdWithRepository(@Param("id") UUID id);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, MergeSessionStatus status);

    @Query("""
            select coalesce(sum(s.conflictsCount), 0) from MergeSession s
             where s.user.id = :userId and s.status = com.visualmerge.model.MergeSessionStatus.COMPLETED
            """)
    long sumResolvedConflicts(@Param("userId") UUID userId);
}
