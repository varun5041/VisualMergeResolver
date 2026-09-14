package com.visualmerge.service;

import com.visualmerge.dto.GitHubRepositoryResponse;
import com.visualmerge.model.Repository;
import com.visualmerge.model.User;
import com.visualmerge.model.UserRepositoryLink;
import com.visualmerge.repository.RepositoryRepository;
import com.visualmerge.repository.UserRepositoryLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persists the repositories that have become relevant to VisualMerge.
 *
 * <p>Browsing does not write here. A row appears the first time a repository is
 * actually used — today that means a merge session was created against it — and
 * is refreshed from GitHub whenever it is used again. GitHub stays the source
 * of truth; this table exists so a session has something stable to point at.
 */
@Service
public class RepositoryCatalogService {

    private final RepositoryRepository repositories;
    private final UserRepositoryLinkRepository links;

    public RepositoryCatalogService(
            RepositoryRepository repositories, UserRepositoryLinkRepository links) {
        this.repositories = repositories;
        this.links = links;
    }

    /**
     * Stores (or refreshes) a repository and records that this user worked with
     * it. Matching is on GitHub's numeric id, so a renamed or transferred
     * repository updates its existing row instead of creating a second one.
     */
    @Transactional
    public Repository remember(User user, GitHubRepositoryResponse source) {
        Repository repository = repositories
                .findByGithubRepositoryId(source.id())
                .orElseGet(Repository::new);

        repository.setGithubRepositoryId(source.id());
        repository.setOwner(source.owner());
        repository.setName(source.name());
        repository.setFullName(source.fullName());
        repository.setPrivateRepository(source.isPrivate());
        repository.setDefaultBranch(source.defaultBranch());
        repository.setHtmlUrl(source.htmlUrl());

        Repository saved = repositories.save(repository);

        // The link is usage history, not permission: access is re-checked
        // against GitHub on every request that needs it.
        var key = new UserRepositoryLink.Key(user.getId(), saved.getId());
        if (!links.existsById(key)) {
            links.save(new UserRepositoryLink(user, saved));
        }
        return saved;
    }
}
