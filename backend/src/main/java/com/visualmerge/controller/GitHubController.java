package com.visualmerge.controller;

import com.visualmerge.dto.GitHubBranchResponse;
import com.visualmerge.dto.GitHubRepositoryResponse;
import com.visualmerge.security.CurrentUser;
import com.visualmerge.service.GitHubService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Live GitHub data for the signed-in user.
 *
 * <p>Every response is whatever GitHub returns for this account's own
 * authorization. Nothing is stored and nothing is invented: an account with no
 * repositories gets an empty list.
 */
@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubService gitHub;
    private final CurrentUser currentUser;

    public GitHubController(GitHubService gitHub, CurrentUser currentUser) {
        this.gitHub = gitHub;
        this.currentUser = currentUser;
    }

    @GetMapping("/repositories")
    public List<GitHubRepositoryResponse> repositories(Authentication authentication) {
        return gitHub.listRepositories(currentUser.requireAccessToken(authentication));
    }

    @GetMapping("/repositories/{owner}/{repo}")
    public GitHubRepositoryResponse repository(
            Authentication authentication,
            @PathVariable String owner,
            @PathVariable String repo) {
        return gitHub.getRepository(currentUser.requireAccessToken(authentication), owner, repo);
    }

    @GetMapping("/repositories/{owner}/{repo}/branches")
    public List<GitHubBranchResponse> branches(
            Authentication authentication,
            @PathVariable String owner,
            @PathVariable String repo) {
        return gitHub.listBranches(currentUser.requireAccessToken(authentication), owner, repo);
    }
}
