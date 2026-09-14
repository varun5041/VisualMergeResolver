package com.visualmerge.repository;

import com.visualmerge.model.MergeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MergeSessionRepository extends JpaRepository<MergeSession, UUID> {
    List<MergeSession> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
