package com.visualmerge.repository;

import com.visualmerge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    /** The primary lookup: GitHub's numeric id is the stable identity. */
    Optional<User> findByGithubId(String githubId);

    /**
     * Only used to adopt accounts created before GitHub identity existed, so a
     * returning user keeps their row instead of colliding on the email unique
     * key. Never used as the identity lookup.
     */
    Optional<User> findByEmail(String email);
}
