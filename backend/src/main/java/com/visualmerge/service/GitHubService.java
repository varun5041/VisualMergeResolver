package com.visualmerge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.visualmerge.dto.GitHubBranchResponse;
import com.visualmerge.dto.GitHubRepositoryResponse;
import com.visualmerge.exception.ForbiddenException;
import com.visualmerge.exception.GitHubApiException;
import com.visualmerge.exception.GitHubAuthorizationException;
import com.visualmerge.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Every call VisualMerge makes to GitHub.
 *
 * <p>Nothing in here touches the database, and nothing outside here talks to
 * GitHub. The access token is passed in per call and never stored, logged or
 * returned — it lives only in Spring Security's authorized-client store on the
 * server.
 */
@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);

    /** GitHub's maximum page size for list endpoints. */
    private static final int PAGE_SIZE = 100;

    private final RestClient client;
    private final int maxRepositoryPages;

    public GitHubService(
            RestClient.Builder builder,
            @Value("${visualmerge.github.api-url}") String apiUrl,
            @Value("${visualmerge.github.timeout-seconds}") int timeoutSeconds,
            @Value("${visualmerge.github.max-repository-pages}") int maxRepositoryPages) {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.client = builder
                .baseUrl(apiUrl)
                .requestFactory(factory)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
        this.maxRepositoryPages = maxRepositoryPages;
    }

    /** The GitHub account behind an access token. */
    public JsonNode currentUser(String accessToken) {
        return get(accessToken, "/user");
    }

    /**
     * Every repository the token can see — owned, collaborated on, and through
     * organisations — most recently updated first.
     *
     * <p>Paged rather than truncated at one page, because a developer with more
     * than a hundred repositories would otherwise silently lose the rest.
     */
    public List<GitHubRepositoryResponse> listRepositories(String accessToken) {
        List<GitHubRepositoryResponse> repositories = new ArrayList<>();
        for (int page = 1; page <= maxRepositoryPages; page++) {
            JsonNode body = get(
                    accessToken,
                    "/user/repos?per_page=%d&page=%d&sort=updated&affiliation=owner,collaborator,organization_member"
                            .formatted(PAGE_SIZE, page));
            if (body == null || !body.isArray() || body.isEmpty()) {
                break;
            }
            body.forEach(node -> repositories.add(toRepository(node)));
            if (body.size() < PAGE_SIZE) {
                break;
            }
        }
        repositories.sort(
                Comparator.comparing(
                                GitHubRepositoryResponse::updatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(GitHubRepositoryResponse::fullName));
        return repositories;
    }

    /**
     * One repository, which doubles as the access check: GitHub answers 404 for
     * repositories the token may not see, so a successful call proves access.
     */
    public GitHubRepositoryResponse getRepository(String accessToken, String owner, String name) {
        JsonNode body = get(accessToken, "/repos/%s/%s".formatted(encode(owner), encode(name)));
        return toRepository(body);
    }

    /** Every branch of a repository the token can read. */
    public List<GitHubBranchResponse> listBranches(String accessToken, String owner, String name) {
        List<GitHubBranchResponse> branches = new ArrayList<>();
        for (int page = 1; page <= maxRepositoryPages; page++) {
            JsonNode body = get(
                    accessToken,
                    "/repos/%s/%s/branches?per_page=%d&page=%d"
                            .formatted(encode(owner), encode(name), PAGE_SIZE, page));
            if (body == null || !body.isArray() || body.isEmpty()) {
                break;
            }
            body.forEach(node -> branches.add(new GitHubBranchResponse(
                    text(node, "name"),
                    node.path("protected").asBoolean(false),
                    text(node.path("commit"), "sha"))));
            if (body.size() < PAGE_SIZE) {
                break;
            }
        }
        return branches;
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    private JsonNode get(String accessToken, String path) {
        try {
            return client.get()
                    .uri(path)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange((request, response) -> {
                        HttpStatusCode status = response.getStatusCode();
                        if (status.is2xxSuccessful()) {
                            return response.bodyTo(JsonNode.class);
                        }
                        throw translate(status, path, response.getHeaders());
                    });
        } catch (ResourceAccessException networkFailure) {
            log.warn("GitHub request failed path={}", path, networkFailure);
            throw GitHubApiException.unreachable(networkFailure);
        }
    }

    /**
     * Turns a GitHub status into something the user can act on. The path is
     * logged but never returned, so a 404 cannot leak whether a private
     * repository exists.
     */
    private RuntimeException translate(HttpStatusCode status, String path, HttpHeaders headers) {
        int code = status.value();
        if (code == 401) {
            log.info("GitHub rejected the stored token path={}", path);
            return GitHubAuthorizationException.missing();
        }
        if (code == 403 && "0".equals(headers.getFirst("X-RateLimit-Remaining"))) {
            log.warn("GitHub rate limit exhausted path={}", path);
            return GitHubApiException.rateLimited();
        }
        if (code == 403) {
            log.info("GitHub refused access path={}", path);
            return ForbiddenException.repositoryAccess(describe(path));
        }
        if (code == 404) {
            log.info("GitHub returned not-found path={}", path);
            return new NotFoundException(
                    "GITHUB_NOT_FOUND",
                    "GitHub has no %s visible to your account.".formatted(describe(path)));
        }
        log.warn("Unexpected GitHub status={} path={}", code, path);
        return new GitHubApiException(
                "GITHUB_ERROR", "GitHub responded with an unexpected error (%d).".formatted(code));
    }

    /** "/repos/acme/site/branches?..." -> "acme/site". Used only in messages. */
    private String describe(String path) {
        String[] parts = path.split("[/?]");
        if (parts.length >= 4 && "repos".equals(parts[1])) {
            return URLEncoder.encode(parts[2], StandardCharsets.UTF_8).equals(parts[2])
                    ? parts[2] + "/" + parts[3]
                    : "repository";
        }
        return "resource";
    }

    private GitHubRepositoryResponse toRepository(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            throw new GitHubApiException("GITHUB_ERROR", "GitHub returned an empty repository.");
        }
        return new GitHubRepositoryResponse(
                node.path("id").isNumber() ? node.path("id").asLong() : null,
                text(node, "name"),
                text(node, "full_name"),
                text(node.path("owner"), "login"),
                node.path("private").asBoolean(false),
                text(node, "default_branch"),
                text(node, "html_url"),
                text(node, "description"),
                text(node, "language"),
                text(node, "updated_at"));
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isTextual() ? value.asText() : null;
    }

    private static String encode(String segment) {
        return URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
