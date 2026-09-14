package com.visualmerge.controller;

import com.visualmerge.dto.MergeApplyRequest;
import com.visualmerge.dto.MergePlanRequest;
import com.visualmerge.model.MergePlan;
import com.visualmerge.model.MergeResult;
import com.visualmerge.service.MergeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/merge")
public class MergeController {

    private final MergeService mergeService;

    public MergeController(MergeService mergeService) {
        this.mergeService = mergeService;
    }

    @PostMapping("/plan")
    public MergePlan plan(@Valid @RequestBody MergePlanRequest request) {
        return mergeService.plan(request);
    }

    @PostMapping("/apply")
    public MergeResult apply(@Valid @RequestBody MergeApplyRequest request) {
        return mergeService.apply(request.planId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MergeResult> result(@PathVariable String id) {
        return mergeService.findResult(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
