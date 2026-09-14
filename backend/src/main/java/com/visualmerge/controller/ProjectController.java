package com.visualmerge.controller;

import com.visualmerge.model.Comparison;
import com.visualmerge.model.Conflict;
import com.visualmerge.model.Project;
import com.visualmerge.dto.CompareRequest;
import com.visualmerge.service.ConflictService;
import com.visualmerge.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projectService;
    private final ConflictService conflictService;

    public ProjectController(ProjectService projectService, ConflictService conflictService) {
        this.projectService = projectService;
        this.conflictService = conflictService;
    }

    @GetMapping("/projects")
    public List<Project> projects() {
        return projectService.findAll();
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<Project> project(@PathVariable String id) {
        return projectService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/projects/{id}/conflicts")
    public List<Conflict> conflicts(@PathVariable String id) {
        return conflictService.conflictsForProject(id);
    }

    @PostMapping("/compare")
    public Comparison compare(@Valid @RequestBody CompareRequest request) {
        return conflictService.compare(request);
    }
}
