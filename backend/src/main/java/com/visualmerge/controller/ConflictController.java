package com.visualmerge.controller;

import com.visualmerge.model.Comparison;
import com.visualmerge.model.Conflict;
import com.visualmerge.service.ConflictService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ConflictController {

    private final ConflictService conflictService;

    public ConflictController(ConflictService conflictService) {
        this.conflictService = conflictService;
    }

    @GetMapping("/comparisons/{id}")
    public ResponseEntity<Comparison> comparison(@PathVariable String id) {
        return conflictService.findComparison(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/conflicts")
    public List<Conflict> conflicts() {
        return conflictService.conflicts();
    }

    @GetMapping("/conflicts/{id}")
    public ResponseEntity<Conflict> conflict(@PathVariable String id) {
        return conflictService.findConflict(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
