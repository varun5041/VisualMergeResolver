package com.visualmerge.repository;

import com.visualmerge.model.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/** Persistence for the repository catalogue. */
public interface RepositoryRepository extends JpaRepository<Repository, UUID> {

    Optional<Repository> findByGithubRepositoryId(Long githubRepositoryId);
}
