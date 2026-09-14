package com.visualmerge.repository;

import com.visualmerge.model.UserRepositoryLink;
import org.springframework.data.jpa.repository.JpaRepository;

/** Persistence for the user-to-repository usage links. */
public interface UserRepositoryLinkRepository
        extends JpaRepository<UserRepositoryLink, UserRepositoryLink.Key> {
}
