package com.visualmerge.controller;

import com.visualmerge.dto.ConnectRepositoryRequest;
import com.visualmerge.dto.ValidateRepositoryResponse;
import com.visualmerge.git.RepositoryUrl;
import com.visualmerge.model.GitRepository;
import com.visualmerge.model.RepositoryBranch;
import com.visualmerge.service.RepositoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Real repository endpoints. Business logic lives in the services; this layer
 * only translates HTTP to calls and back.
 */
@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    private final RepositoryService repositoryService;

    public RepositoryController(RepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    /** Checks a URL without cloning — used for fast feedback while typing. */
    @PostMapping("/validate")
    public ValidateRepositoryResponse validate(@Valid @RequestBody ConnectRepositoryRequest request) {
        RepositoryService.ValidationResult result = repositoryService.validate(request.url());
        RepositoryUrl url = result.url();
        return new ValidateRepositoryResponse(
                true, url.owner(), url.name(), url.fullName(), url.webUrl(), result.branchCount());
    }

    /** Validates, clones into an isolated workspace and discovers real branches. */
    @PostMapping
    public ResponseEntity<GitRepository> connect(
            @Valid @RequestBody ConnectRepositoryRequest request) {
        GitRepository repository = repositoryService.connect(request.url());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository);
    }

    @GetMapping
    public List<GitRepository> listConnected() {
        return repositoryService.listConnected();
    }

    @GetMapping("/{id}")
    public GitRepository get(@PathVariable String id) {
        return repositoryService.require(id);
    }

    @GetMapping("/{id}/branches")
    public List<RepositoryBranch> branches(@PathVariable String id) {
        return repositoryService.branches(id);
    }

    @PostMapping("/{id}/refresh")
    public GitRepository refresh(@PathVariable String id) {
        return repositoryService.refreshBranches(id);
    }

    /** Disconnects and deletes the temporary workspace. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> disconnect(@PathVariable String id) {
        boolean removed = repositoryService.disconnect(id);
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
