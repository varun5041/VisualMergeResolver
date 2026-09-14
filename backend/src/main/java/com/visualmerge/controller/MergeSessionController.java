package com.visualmerge.controller;

import com.visualmerge.dto.CreateMergeSessionRequest;
import com.visualmerge.dto.MergeSessionResponse;
import com.visualmerge.dto.MergeSessionStatsResponse;
import com.visualmerge.model.User;
import com.visualmerge.security.CurrentUser;
import com.visualmerge.service.MergeSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Persistent merge sessions, scoped to the account that owns them. */
@RestController
@RequestMapping("/api/merge-sessions")
public class MergeSessionController {

    private final MergeSessionService mergeSessions;
    private final CurrentUser currentUser;

    public MergeSessionController(MergeSessionService mergeSessions, CurrentUser currentUser) {
        this.mergeSessions = mergeSessions;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<MergeSessionResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateMergeSessionRequest request) {
        User user = currentUser.require(authentication);
        String accessToken = currentUser.requireAccessToken(authentication);
        var session = mergeSessions.create(user, accessToken, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(MergeSessionResponse.from(session));
    }

    @GetMapping
    public List<MergeSessionResponse> list(Authentication authentication) {
        return mergeSessions.listFor(currentUser.require(authentication)).stream()
                .map(MergeSessionResponse::from)
                .toList();
    }

    @GetMapping("/stats")
    public MergeSessionStatsResponse stats(Authentication authentication) {
        return mergeSessions.statsFor(currentUser.require(authentication));
    }

    @GetMapping("/{id}")
    public MergeSessionResponse get(Authentication authentication, @PathVariable String id) {
        User user = currentUser.require(authentication);
        return MergeSessionResponse.from(mergeSessions.requireOwned(user, id));
    }
}
