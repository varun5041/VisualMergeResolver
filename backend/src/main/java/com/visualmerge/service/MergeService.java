package com.visualmerge.service;

import com.visualmerge.dto.MergePlanRequest;
import com.visualmerge.model.ChangedFile;
import com.visualmerge.model.Commit;
import com.visualmerge.model.Comparison;
import com.visualmerge.model.Conflict;
import com.visualmerge.model.MergePlan;
import com.visualmerge.model.MergePlanItem;
import com.visualmerge.model.MergeRequest;
import com.visualmerge.model.MergeResult;
import com.visualmerge.model.PreviewComposition;
import com.visualmerge.model.Project;
import com.visualmerge.model.Verification;
import com.visualmerge.model.VerificationCheck;
import com.visualmerge.model.VerificationStep;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Turns a set of per-conflict resolutions into a merge plan, and turns an
 * approved plan into a merge result. Everything is mocked and held in memory.
 */
@Service
public class MergeService {

    static final String COMBINE = "COMBINE";
    static final String BRANCH_A = "BRANCH_A";
    static final String BRANCH_B = "BRANCH_B";

    private final ProjectService projectService;
    private final ConflictService conflictService;
    private final Map<String, MergePlan> plans = new ConcurrentHashMap<>();
    private final Map<String, MergeResult> results = new ConcurrentHashMap<>();
    private final AtomicInteger planSequence = new AtomicInteger(1);
    private final AtomicInteger resultSequence = new AtomicInteger(1);
    private final AtomicInteger prNumber = new AtomicInteger(142);

    public MergeService(ProjectService projectService, ConflictService conflictService) {
        this.projectService = projectService;
        this.conflictService = conflictService;
    }

    public MergePlan plan(MergePlanRequest request) {
        Comparison comparison = conflictService.requireComparison(request.comparisonId());
        Map<String, String> strategies = new LinkedHashMap<>();
        Map<String, String> instructions = new LinkedHashMap<>();

        for (Conflict conflict : comparison.conflicts()) {
            strategies.put(conflict.id(), normalise(request.strategy()));
            instructions.put(conflict.id(), conflict.defaultInstruction());
        }
        if (request.resolutions() != null) {
            for (MergePlanRequest.Resolution resolution : request.resolutions()) {
                if (resolution.conflictId() == null || !strategies.containsKey(resolution.conflictId())) {
                    continue;
                }
                strategies.put(resolution.conflictId(), normalise(resolution.strategy()));
                if (resolution.instruction() != null && !resolution.instruction().isBlank()) {
                    instructions.put(resolution.conflictId(), resolution.instruction().trim());
                }
            }
        }

        List<MergePlanItem> items = new ArrayList<>();
        for (Conflict conflict : comparison.conflicts()) {
            items.addAll(itemsFor(conflict, strategies.get(conflict.id())));
        }

        String primaryStrategy = strategies.getOrDefault("conflict-navbar", COMBINE);
        String primaryInstruction = firstInstruction(request, instructions);

        MergePlan plan = new MergePlan(
                "plan_" + planSequence.getAndIncrement(),
                comparison.id(),
                comparison.projectId(),
                primaryStrategy,
                strategyLabel(primaryStrategy),
                primaryInstruction,
                List.copyOf(strategies.keySet()),
                comparison.conflicts().size(),
                summary(strategies),
                items,
                notes(strategies),
                new PreviewComposition(
                        variantFor(strategies.get("conflict-navbar")),
                        variantFor(strategies.get("conflict-hero")),
                        "MERGED"),
                Instant.now().toString());

        plans.put(plan.id(), plan);
        return plan;
    }

    public Optional<MergePlan> findPlan(String id) {
        return Optional.ofNullable(plans.get(id));
    }

    public MergeResult apply(String planId) {
        MergePlan plan = findPlan(planId).orElseThrow(
                () -> new IllegalArgumentException("Unknown merge plan: " + planId));
        Project project = projectService.requireById(plan.projectId());
        Comparison comparison = conflictService.requireComparison(plan.comparisonId());

        MergeResult result = new MergeResult(
                "merge_" + resultSequence.getAndIncrement(),
                plan.id(),
                plan.projectId(),
                "READY",
                plan,
                plan.preview(),
                verification(),
                mergeRequest(project, comparison, plan),
                Instant.now().toString());

        results.put(result.id(), result);
        return result;
    }

    public Optional<MergeResult> findResult(String id) {
        return Optional.ofNullable(results.get(id));
    }

    private List<MergePlanItem> itemsFor(Conflict conflict, String strategy) {
        List<MergePlanItem> items = new ArrayList<>();
        boolean combine = COMBINE.equals(strategy);
        List<String> fromA = conflict.branchAChanges();
        List<String> fromB = conflict.branchBChanges();

        if (combine) {
            // The AI keeps look-and-feel from A and functional menus from B.
            addAll(items, conflict, fromA, "Branch A", "ganpati-theme", "Kept from Branch A");
            addAll(items, conflict, fromB, "Branch B", "navbar-feature", "Kept from Branch B");
        } else if (BRANCH_B.equals(strategy)) {
            addAll(items, conflict, fromB, "Branch B", "navbar-feature", "Kept from Branch B");
            addAll(items, conflict, fromA, "Dropped", "ganpati-theme", "Discarded — Branch B selected");
        } else {
            addAll(items, conflict, fromA, "Branch A", "ganpati-theme", "Kept from Branch A");
            addAll(items, conflict, fromB, "Dropped", "navbar-feature", "Discarded — Branch A selected");
        }
        return items;
    }

    private void addAll(List<MergePlanItem> target, Conflict conflict, List<String> features,
                        String source, String sourceBranch, String note) {
        for (String feature : features) {
            target.add(new MergePlanItem(
                    conflict.id() + "-" + slug(feature),
                    conflict.title(),
                    feature,
                    source,
                    sourceBranch,
                    note));
        }
    }

    private String summary(Map<String, String> strategies) {
        long combined = strategies.values().stream().filter(COMBINE::equals).count();
        if (combined == strategies.size()) {
            return "Both components were composed from the two branches. "
                    + "Festival styling stays from Branch A, account menus stay from Branch B.";
        }
        if (combined == 0) {
            return "Every conflict was resolved by taking a single branch wholesale.";
        }
        return combined + " of " + strategies.size()
                + " conflicts were composed from both branches, the rest take a single branch.";
    }

    private List<String> notes(Map<String, String> strategies) {
        List<String> notes = new ArrayList<>();
        notes.add("No changes were made outside the two conflicting components.");
        if (strategies.containsValue(COMBINE)) {
            notes.add("Navbar spacing from Branch B was widened to fit the Ganpati logo treatment.");
        }
        notes.add("Footer changes from both branches applied cleanly and needed no decision.");
        return notes;
    }

    private Verification verification() {
        return new Verification(
                List.of(
                        new VerificationStep("build", "Building application...", 900),
                        new VerificationStep("navbar", "Checking navbar...", 700),
                        new VerificationStep("notifications", "Checking notification menu...", 650),
                        new VerificationStep("profile", "Checking profile menu...", 650),
                        new VerificationStep("responsive", "Checking responsive layout...", 800),
                        new VerificationStep("regression", "Visual regression check...", 950)),
                List.of(
                        new VerificationCheck("build", "Build passed", "PASSED"),
                        new VerificationCheck("ui", "UI verified", "PASSED"),
                        new VerificationCheck("interactions", "Interactions verified", "PASSED"),
                        new VerificationCheck("responsive", "Responsive layout verified", "PASSED")),
                "Merge candidate looks good.");
    }

    private MergeRequest mergeRequest(Project project, Comparison comparison, MergePlan plan) {
        int number = prNumber.getAndIncrement();
        return new MergeRequest(
                "mr_" + number,
                number,
                "Merge " + comparison.branchA() + " into " + comparison.baseBranch(),
                "Resolved with VisualMerge.\n\n" + plan.summary()
                        + "\n\nInstruction: \"" + plan.instruction() + "\"",
                comparison.branchA(),
                comparison.baseBranch(),
                "https://github.com/" + project.repository() + "/pull/" + number,
                "OPEN",
                4,
                186,
                74,
                List.of(
                        new Commit("8f2a1c4", "merge: compose navbar from ganpati-theme and navbar-feature",
                                "visualmerge[bot]", "just now"),
                        new Commit("3e91b07", "merge: compose hero section from both branches",
                                "visualmerge[bot]", "just now"),
                        new Commit("c40d55a", "chore: apply footer changes from both branches",
                                "visualmerge[bot]", "just now")),
                List.of(
                        new ChangedFile("src/components/Navbar.tsx", "modified", 94, 41),
                        new ChangedFile("src/components/Hero.tsx", "modified", 61, 28),
                        new ChangedFile("src/components/Footer.tsx", "modified", 18, 5),
                        new ChangedFile("src/styles/festival.css", "added", 13, 0)));
    }

    private String firstInstruction(MergePlanRequest request, Map<String, String> instructions) {
        if (request.instruction() != null && !request.instruction().isBlank()) {
            return request.instruction().trim();
        }
        return instructions.values().stream().findFirst().orElse("");
    }

    static String normalise(String strategy) {
        if (strategy == null || strategy.isBlank()) {
            return COMBINE;
        }
        String upper = strategy.trim().toUpperCase();
        return switch (upper) {
            case BRANCH_A, BRANCH_B, COMBINE -> upper;
            default -> COMBINE;
        };
    }

    static String strategyLabel(String strategy) {
        return switch (strategy) {
            case BRANCH_A -> "Use Branch A";
            case BRANCH_B -> "Use Branch B";
            default -> "Combine with AI";
        };
    }

    static String variantFor(String strategy) {
        return switch (normalise(strategy)) {
            case BRANCH_A -> "BRANCH_A";
            case BRANCH_B -> "BRANCH_B";
            default -> "MERGED";
        };
    }

    private static String slug(String value) {
        return value.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}
