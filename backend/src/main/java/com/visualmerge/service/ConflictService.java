package com.visualmerge.service;

import com.visualmerge.dto.CompareRequest;
import com.visualmerge.model.AiAnalysis;
import com.visualmerge.model.CodeDiff;
import com.visualmerge.model.Comparison;
import com.visualmerge.model.CompatibleChange;
import com.visualmerge.model.Conflict;
import com.visualmerge.model.Project;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Produces the mocked branch comparison for the CauseKind demo and keeps the
 * result in memory so the merge endpoints can refer back to it.
 */
@Service
public class ConflictService {

    private final ProjectService projectService;
    private final Map<String, Comparison> comparisons = new ConcurrentHashMap<>();
    private final AtomicInteger sequence = new AtomicInteger(1);

    public ConflictService(ProjectService projectService) {
        this.projectService = projectService;
    }

    public List<String> analysisSteps() {
        return List.of(
                "Analyzing branches...",
                "Comparing changes...",
                "Detecting conflicts...",
                "Preparing previews...");
    }

    public Comparison compare(CompareRequest request) {
        Project project = projectService.requireById(request.projectId());
        String id = "cmp_" + sequence.getAndIncrement();
        Comparison comparison = new Comparison(
                id,
                project.id(),
                value(request.baseBranch(), project.baseBranch()),
                value(request.branchA(), project.branchA().name()),
                value(request.branchB(), project.branchB().name()),
                Instant.now().toString(),
                2,
                conflicts(),
                compatibleChanges(),
                analysisSteps(),
                14,
                486,
                132);
        comparisons.put(id, comparison);
        return comparison;
    }

    public Optional<Comparison> findComparison(String id) {
        return Optional.ofNullable(comparisons.get(id));
    }

    public Comparison requireComparison(String id) {
        return findComparison(id).orElseThrow(
                () -> new IllegalArgumentException("Unknown comparison: " + id));
    }

    public List<Conflict> conflictsForProject(String projectId) {
        projectService.requireById(projectId);
        return conflicts();
    }

    public Optional<Conflict> findConflict(String conflictId) {
        return conflicts().stream().filter(c -> c.id().equals(conflictId)).findFirst();
    }

    public List<CompatibleChange> compatibleChanges() {
        return List.of(new CompatibleChange(
                "compatible-footer",
                "Footer",
                "footer",
                "COMPATIBLE",
                "No conflict detected. Changes apply cleanly on top of main.",
                "src/components/Footer.tsx"));
    }

    public List<Conflict> conflicts() {
        return List.of(navbarConflict(), heroConflict());
    }

    private Conflict navbarConflict() {
        AiAnalysis analysis = new AiAnalysis(
                "Branch A restyles the navigation shell for the Ganpati festival release. "
                        + "Branch B adds two account-level menus to the same header. "
                        + "The two sets of changes touch different regions of the component.",
                List.of("Animated festival navbar", "Ganpati logo treatment", "Mobile navigation", "Navbar styling"),
                List.of("Notification menu", "Profile menu", "Navbar spacing"),
                "These changes appear partially compatible and can likely be combined.",
                "PARTIALLY_COMPATIBLE",
                92);

        CodeDiff diff = new CodeDiff(
                "src/components/Navbar.tsx",
                "tsx",
                NAVBAR_A_SOURCE,
                NAVBAR_B_SOURCE,
                NAVBAR_CONFLICT_MARKERS);

        return new Conflict(
                "conflict-navbar",
                "Navbar",
                "navbar",
                "UI Conflict",
                "HIGH",
                "UNRESOLVED",
                "Both branches modified this component.",
                "src/components/Navbar.tsx",
                analysis.branchA(),
                analysis.branchB(),
                analysis,
                diff,
                "Keep the animated Ganpati navbar from Branch A, but keep the notification "
                        + "and profile menus from Branch B.");
    }

    private Conflict heroConflict() {
        AiAnalysis analysis = new AiAnalysis(
                "Branch A swaps the hero for a seasonal festival campaign. Branch B restructures "
                        + "the same hero into a two-column layout with a live donation counter. "
                        + "The headline copy is the only region both branches rewrite.",
                List.of("Festival campaign banner", "Diya accent background", "Festival headline copy"),
                List.of("Live donation counter", "Two-column layout", "Secondary CTA"),
                "These changes appear partially compatible and can likely be combined.",
                "PARTIALLY_COMPATIBLE",
                87);

        CodeDiff diff = new CodeDiff(
                "src/components/Hero.tsx",
                "tsx",
                HERO_A_SOURCE,
                HERO_B_SOURCE,
                HERO_CONFLICT_MARKERS);

        return new Conflict(
                "conflict-hero",
                "Hero Section",
                "hero",
                "UI Conflict",
                "MEDIUM",
                "UNRESOLVED",
                "Both branches modified this component.",
                "src/components/Hero.tsx",
                analysis.branchA(),
                analysis.branchB(),
                analysis,
                diff,
                "Keep the festival hero styling from Branch A, but keep the live donation "
                        + "counter from Branch B.");
    }

    private static String value(String candidate, String fallback) {
        return candidate == null || candidate.isBlank() ? fallback : candidate;
    }

    private static final String NAVBAR_A_SOURCE = """
            export function Navbar() {
              return (
                <header className="ck-nav ck-nav--festival">
                  <GanpatiMark animated />
                  <nav className="ck-nav__links">
                    <a href="/">Home</a>
                    <a href="/causes">Causes</a>
                    <a href="/donate">Donate</a>
                    <a href="/about">About</a>
                  </nav>
                  <DonateButton variant="festival" />
                  <MobileMenuToggle />
                </header>
              );
            }
            """;

    private static final String NAVBAR_B_SOURCE = """
            export function Navbar({ user }: NavbarProps) {
              return (
                <header className="ck-nav ck-nav--wide">
                  <Logo />
                  <nav className="ck-nav__links ck-nav__links--spaced">
                    <a href="/">Home</a>
                    <a href="/causes">Causes</a>
                    <a href="/donate">Donate</a>
                    <a href="/about">About</a>
                  </nav>
                  <NotificationMenu count={3} />
                  <ProfileMenu user={user} />
                </header>
              );
            }
            """;

    private static final String NAVBAR_CONFLICT_MARKERS = """
            <<<<<<< HEAD (ganpati-theme)
              <header className="ck-nav ck-nav--festival">
                <GanpatiMark animated />
                <DonateButton variant="festival" />
                <MobileMenuToggle />
            =======
              <header className="ck-nav ck-nav--wide">
                <Logo />
                <NotificationMenu count={3} />
                <ProfileMenu user={user} />
            >>>>>>> navbar-feature
            """;

    private static final String HERO_A_SOURCE = """
            export function Hero() {
              return (
                <section className="ck-hero ck-hero--festival">
                  <DiyaBackdrop />
                  <h1>Celebrate by giving back this Ganesh Chaturthi</h1>
                  <DonateButton size="lg" variant="festival" />
                </section>
              );
            }
            """;

    private static final String HERO_B_SOURCE = """
            export function Hero() {
              return (
                <section className="ck-hero ck-hero--split">
                  <div>
                    <h1>Fund the causes your community cares about</h1>
                    <DonateButton size="lg" />
                    <SecondaryCta href="/causes">Browse causes</SecondaryCta>
                  </div>
                  <LiveDonationCounter />
                </section>
              );
            }
            """;

    private static final String HERO_CONFLICT_MARKERS = """
            <<<<<<< HEAD (ganpati-theme)
              <section className="ck-hero ck-hero--festival">
                <DiyaBackdrop />
                <h1>Celebrate by giving back this Ganesh Chaturthi</h1>
            =======
              <section className="ck-hero ck-hero--split">
                <h1>Fund the causes your community cares about</h1>
                <LiveDonationCounter />
            >>>>>>> navbar-feature
            """;
}
