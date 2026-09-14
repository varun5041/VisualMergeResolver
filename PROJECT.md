# VisualMerge — Complete Project Documentation

> **Resolve conflicts by seeing the result, not reading the diff.**

**Document version:** 1.0 · **Last updated:** 14 September 2026
**Status:** Phase 1 of 8 complete (real repository connection) · Demo Mode fully playable
**Repository:** https://github.com/varun5041/VisualMergeResolver

---

## Table of contents

1. [The problem](#1-the-problem)
2. [The product idea](#2-the-product-idea)
3. [What is real today vs what is mocked](#3-what-is-real-today-vs-what-is-mocked)
4. [Technology stack](#4-technology-stack)
5. [Repository layout](#5-repository-layout)
6. [Backend architecture](#6-backend-architecture)
7. [Frontend architecture](#7-frontend-architecture)
8. [How the browser previews work](#8-how-the-browser-previews-work)
9. [Merge resolution — how it works end to end](#9-merge-resolution--how-it-works-end-to-end)
10. [Complete API reference](#10-complete-api-reference)
11. [Data models](#11-data-models)
12. [Security model](#12-security-model)
13. [Testing](#13-testing)
14. [Running the project](#14-running-the-project)
15. [Roadmap — Phases 2 to 8](#15-roadmap--phases-2-to-8)
16. [Cloud database plan](#16-cloud-database-plan)
17. [Deployment and infrastructure plan](#17-deployment-and-infrastructure-plan)
18. [Known limitations](#18-known-limitations)
19. [Decision log](#19-decision-log)

---

## 1. The problem

When two branches change the same file, Git hands you this:

```
<<<<<<< HEAD
code from branch A
=======
code from branch B
>>>>>>> branch B
```

This asks a person to reconstruct, purely in their head, what each version of the
application *looked like and did* — and then to type the correct combination by hand.

For a developer who knows the codebase, that is tedious. For a "vibe coder" — someone
building with AI assistance who may not fully understand the underlying code — it is a
hard stop. They cannot evaluate a merge they cannot picture.

The insight behind VisualMerge is that **for UI changes, the diff is the wrong
representation**. What the person actually wants to decide is "which of these two
screens do I want, or what combination of them?" — a visual question being asked in
textual form.

---

## 2. The product idea

VisualMerge replaces the conflict marker with a comparison of running applications.

```
Traditional Git tool                    VisualMerge
────────────────────                    ───────────
Code                                    Repository
  → diff                                  → real conflict
  → conflict markers                      → running Version A  |  running Version B
  → developer resolves by hand            → visual understanding
                                          → natural-language instruction
                                          → AI composes the resolution
                                          → running merged application
                                          → visual verification
                                          → approval
```

The user says something like:

> "Keep the animated Ganpati navbar from Branch A, but keep the notification and
> profile menus from Branch B."

…and VisualMerge produces a merged version, runs it, verifies it, and shows it.

### Core product principle

**Code is not the primary interface.** The running result is. A code diff exists as an
optional secondary view ("View Code Diff") and must never dominate the screen.

VisualMerge is explicitly *not* trying to become another Git GUI.

---

## 3. What is real today vs what is mocked

This distinction is enforced in the product itself, not just in documentation. The
application has **two modes that never mix**.

### Real Repository mode — genuinely real

| Capability | Status |
|---|---|
| Accept a public GitHub URL | Real |
| Validate URL format, host, ownership path | Real |
| Confirm repository exists and is readable | Real (`git ls-remote`, no download) |
| Clone into an isolated workspace | Real (bare clone via JGit) |
| Discover branches with commit metadata | Real |
| Select Base / Branch A / Branch B | Real |
| Workspace cleanup and TTL sweeping | Real |
| **Merge analysis / conflict detection** | **Not implemented — button disabled and labelled** |
| Previews, AI resolution, verification, PR | Not implemented |

Real Repository mode **never falls back to mock data**. If something fails, the actual
failure is shown with its error code. Anything not yet built is labelled unavailable
rather than simulated.

### Demo Mode — entirely mock data, labelled as such

The CauseKind walkthrough demonstrates the complete intended experience end to end:
conflict overview → visual resolver → AI analysis → natural-language instruction →
merge plan → merged preview → verification → merge candidate → pull request modal.

Every screen works and every button is wired, but the repository, conflicts, AI
analysis and verification are all fabricated fixtures. The UI marks this with a
`Demo Mode` / `Mock data` chip.

**Demo Mode exists to prove the product experience. Real Repository mode exists to
build it for real, one phase at a time.**

### Phase status

| Phase | Scope | State |
|---|---|---|
| 1 | Public GitHub URL → validate → clone → discover real branches | **Complete** |
| 2 | Real three-way merge analysis and conflict detection | Not started |
| 3 | Isolated per-branch worktrees | Not started |
| 4 | React/Vite detection + Docker runtimes + real branch previews | Not started |
| 5 | Resolver UI wired to real conflicts | Not started |
| 6 | AI-assisted resolution | Not started |
| 7 | Merged candidate build + real browser verification | Not started |
| 8 | Result branch / pull request | Not started |

---

## 4. Technology stack

### Backend

| Component | Choice | Version |
|---|---|---|
| Language | Java | 21 target (built on JDK 25, `--release 21`) |
| Framework | Spring Boot | 3.5.6 |
| Build | Maven | 3.9+ |
| Web | Spring Web (REST) | — |
| Validation | Spring Validation (Jakarta) | — |
| Git | **Eclipse JGit** | 7.8.0.202609011348-r |
| Persistence | **None** — in-memory + filesystem | — |
| Tests | JUnit 5 + AssertJ + MockMvc | via `spring-boot-starter-test` |

### Frontend

| Component | Choice | Version |
|---|---|---|
| Library | React | 19.2 |
| Language | TypeScript | 6.0 |
| Build | Vite | 8.3 |
| Styling | Tailwind CSS | 4.3 (CSS-first `@theme`) |
| Routing | React Router | 7.18 |
| Icons | Hand-written inline SVG | no dependency |
| State | React Context + `sessionStorage` | no Redux |

### Deliberately not used

Next.js (explicitly excluded), any CSS/component library, any database, any
authentication provider, Docker (planned Phase 4), any real LLM API (planned Phase 6).

### Size

- Backend: **2,730 lines** across 46 Java files (42 main, 4 test)
- Frontend: **5,741 lines** across 40 TypeScript/CSS files

---

## 5. Repository layout

```
VisualMergeResolver/
├── README.md                  Quick start and feature overview
├── PROJECT.md                 This document
├── .gitignore
│
├── backend/                   Spring Boot REST API
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/visualmerge/
│       │   ├── VisualMergeApplication.java
│       │   ├── config/        WebConfig, ApiExceptionHandler, WorkspaceProperties
│       │   ├── git/           RepositoryUrl, GitService, GitOperationException
│       │   ├── model/         Domain records (17 files)
│       │   ├── dto/           Request/response records (7 files)
│       │   ├── service/       RepositoryService, WorkspaceService,
│       │   │                  ProjectService, ConflictService, MergeService
│       │   └── controller/    RepositoryController, ProjectController,
│       │                      ConflictController, MergeController
│       ├── main/resources/
│       │   └── application.properties
│       └── test/java/com/visualmerge/
│           ├── git/           RepositoryUrlTest, GitServiceTest
│           ├── service/       WorkspaceServiceTest
│           └── controller/    RepositoryControllerCorsTest
│
└── frontend/                  React SPA
    ├── package.json
    ├── vite.config.ts         Tailwind plugin + /api proxy to :8080
    ├── index.html
    ├── public/favicon.svg
    └── src/
        ├── main.tsx           Entry + BrowserRouter
        ├── App.tsx            Routes
        ├── index.css          Tailwind theme tokens, keyframes, utilities
        ├── components/        17 reusable UI components
        │   └── preview/       7 files — the simulated CauseKind website
        ├── pages/             6 route-level pages
        ├── services/          api.ts (demo), repositoryApi.ts (real)
        ├── state/             FlowContext.tsx
        ├── data/              mockData.ts
        ├── lib/               hooks.ts, utils.ts
        └── types/             index.ts (demo), repository.ts (real)
```

---

## 6. Backend architecture

### Layering rule

Controllers translate HTTP only. **No business logic lives in a controller.** Services
own all behaviour and state. The `git/` package isolates every Git interaction.

```
HTTP request
    ↓
Controller          validates payload shape, maps to service call
    ↓
Service             orchestration, state, logging, error classification
    ↓
git/ package        JGit operations (the only code that touches a repository)
    ↓
Filesystem          isolated workspace under an app-managed root
```

### Package responsibilities

#### `config/`

| Class | Responsibility |
|---|---|
| `WebConfig` | CORS for the Vite dev origin. Allows `GET, POST, DELETE, OPTIONS` on `/api/**`. |
| `ApiExceptionHandler` | `@RestControllerAdvice`. Maps `GitOperationException` codes to HTTP status, logs the internal cause, returns only the user-safe message. |
| `WorkspaceProperties` | `@ConfigurationProperties("visualmerge.workspace")` — root path, clone timeout, size cap, session TTL, shutdown cleanup. |

#### `git/` — the Git boundary

| Class | Responsibility |
|---|---|
| `RepositoryUrl` | **The trust boundary.** Parses and validates user-supplied URLs. Immutable value object. Rebuilds the clone URL from parsed parts rather than trusting raw input. |
| `GitService` | All JGit operations: `listRemoteRefs`, `cloneBare`, `listBranches`, `resolveDefaultBranch`. Translates JGit transport failures into typed errors. |
| `GitOperationException` | Typed failure with a stable `Code` enum and a message written for a human. |

**Why JGit rather than shelling out to `git`:** a pure-Java library means no
user-supplied text is ever interpreted as a shell command, there is no dependency on a
`git` binary being installed, and Phase 2 gets a programmatic three-way merger
(`ResolveMerger`) that reports conflict hunks as data rather than as text to be parsed.

#### `service/`

| Class | Responsibility | State |
|---|---|---|
| `WorkspaceService` | Creates, measures, sweeps and deletes isolated session directories. Validates every path stays under the root. | Filesystem |
| `RepositoryService` | Validate → clone (bounded executor + timeout) → size check → branch discovery → registry. Structured operation logging. | `ConcurrentHashMap` |
| `ProjectService` | The hardcoded CauseKind demo project. | Immutable list |
| `ConflictService` | Demo comparison and the two fabricated conflicts. | `ConcurrentHashMap` |
| `MergeService` | Demo merge plans and results; strategy genuinely drives plan contents. | `ConcurrentHashMap` |

#### Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_URL` | 400 | Not a usable public GitHub repository URL |
| `REPOSITORY_NOT_FOUND` | 404 | Does not exist, or is private (GitHub is deliberately ambiguous to anonymous clients) |
| `REPOSITORY_INACCESSIBLE` | 403 | GitHub explicitly declined |
| `REPOSITORY_TOO_LARGE` | 413 | Exceeds the configured size cap |
| `CLONE_TIMEOUT` | 504 | Clone exceeded the timeout |
| `NO_BRANCHES` | 422 | Nothing to compare |
| `CLONE_FAILED` | 502 | Transport or Git failure |
| `UNKNOWN_REPOSITORY` | 404 | Session id no longer registered |
| `WORKSPACE_ERROR` | 502 | Local filesystem failure |

### Configuration

```properties
server.port=8080
visualmerge.cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173

visualmerge.workspace.root=${java.io.tmpdir}/visualmerge-workspaces
visualmerge.workspace.clone-timeout-seconds=120
visualmerge.workspace.max-repository-size-mb=500
visualmerge.workspace.session-ttl-minutes=120
visualmerge.workspace.cleanup-on-shutdown=true
```

### Observability

Every repository operation logs one structured line:

```
connect repository=octocat/Hello-World id=repo_9acdb0d7ba14 branches=3 sizeKb=3 duration=1763ms result=OK
connect repository=owner/missing duration=366ms result=REPOSITORY_NOT_FOUND stage=validate
```

Never logged: tokens, credentials, repository source content.

---

## 7. Frontend architecture

### Routes

| Route | Page | Mode |
|---|---|---|
| `/` | `Dashboard` | Entry — offers both modes |
| `/connect` | `ConnectRepository` | **Real** |
| `/analyzing` | `Analyzing` | Demo |
| `/conflicts` | `ConflictOverview` | Demo |
| `/resolve` | `ConflictResolver` | Demo |
| `/merge` | `MergeResultPage` | Demo |
| `*` | redirect to `/` | — |

### Component inventory

**Application shell and primitives**

| Component | Purpose |
|---|---|
| `AppShell` | Sticky header, progress steps, repository chip, API status chip |
| `ui.tsx` | `Button`, `Panel`, `PanelHeader`, `Chip`, `Mono` |
| `Icons.tsx` | 24 hand-written inline SVG icons (no icon dependency) |
| `Modal` | Focus-safe dialog with escape handling and scroll lock |
| `ProgressSteps` | Five-step flow indicator |
| `StatusBadge`, `BranchBadge` | Status and branch chips |

**Real repository**

| Component | Purpose |
|---|---|
| `BranchSelect` | Native select styled to the design system; shows tip commit metadata |

**Merge resolution (Demo Mode, reusable for Phase 5)**

| Component | Purpose |
|---|---|
| `BrowserPreview` | Browser-chrome frame with scaled viewport, device toggle, reload |
| `ConflictCard`, `CompatibleCard` | Conflict list entries |
| `AIAnalysisPanel` | Per-branch change lists and recommendation |
| `InstructionPanel` | Strategy selector + natural-language instruction box |
| `MergePlanPanel` | Feature-by-feature plan, grouped by component |
| `VerificationPanel` | Sequenced verification steps and checks |
| `AiThinking` | Model-working animation |
| `CodeDiffModal` | Optional secondary code view |
| `MergeRequestModal` | Mock pull request detail |

**Simulated website** (`components/preview/`) — see section 8.

### State management

| Concern | Mechanism |
|---|---|
| Demo flow (comparison, per-conflict resolutions, plan, result) | `FlowContext` + `sessionStorage` |
| Connected repository | Component state + `sessionStorage` repo id, re-fetched on mount |
| API connectivity indicator | Module-level observable in `services/api.ts` |

### The two API clients — an important distinction

| Client | Used by | On failure |
|---|---|---|
| `services/api.ts` | Demo Mode | **Falls back** to `data/mockData.ts`, flips header chip to "Offline mock data" |
| `services/repositoryApi.ts` | Real Repository | **Never falls back.** Throws `RepositoryError` with the backend's code, rendered in the UI |

This separation is the mechanism that makes "no fake success in the real flow" a
structural property rather than a promise.

### Design language

Dark developer-tool aesthetic modelled on GitHub, Linear, Vercel and browser devtools.
Tailwind v4 CSS-first theming in `index.css`: `--color-ink-*` surfaces, `--color-fg-*`
text, `--color-brand-*` accent, and branch identity colours (`branch-a` amber,
`branch-b` violet, `merged` emerald) used consistently across every screen.

---

## 8. How the browser previews work

This is the visual centrepiece, and the part most often misunderstood, so it is worth
being precise.

**The previews are live React components, not screenshots and not iframes of a real
site.** In Demo Mode they render a fabricated but complete website ("CauseKind") in
three variants.

### The scaling technique

A real desktop website rendered into a 560px-wide panel would look like a mobile
layout. Instead:

1. The site renders at a **fixed virtual width** — 1280px desktop, 390px mobile.
2. A `ResizeObserver` measures the actual container width.
3. The content is scaled with `transform: scale(containerWidth / 1280)` and
   `transformOrigin: top left`.
4. A spacer div sized `virtualHeight × scale` preserves scrolling.

The result reads as a genuine desktop website, and scrolling, dropdowns and the mobile
menu all behave normally inside the frame.

### Why breakpoints cannot be used inside a preview

CSS media queries key off the **real browser window**, not the virtual viewport. A
preview showing a 390px-wide phone layout inside a 1500px window would still match
desktop breakpoints. Every preview component therefore takes an explicit `compact`
prop instead of using Tailwind responsive prefixes.

### The three variants are genuinely composed

| File | Contents |
|---|---|
| `navbars.tsx` | `NavbarA` (festival), `NavbarB` (account menus), `NavbarMerged` |
| `heroes.tsx` | `HeroA`, `HeroB`, `HeroMerged`, `LiveDonationCounter` |
| `menus.tsx` | `NotificationMenu`, `ProfileMenu` — Branch B's features |
| `navbarParts.tsx` | `FestivalStrip`, `MobileNav`, `DonateButton`, `NavLinks` — Branch A's features |
| `marks.tsx` | `GanpatiMark`, `CkLogo`, `ToranGarland`, `DiyaIcon`, `Avatar` |
| `sections.tsx` | Shared causes grid, trust strip, footer |
| `SitePage.tsx` | Assembles a variant and draws the inspector-style conflict highlight |

`NavbarMerged` **imports the same `NotificationMenu` and `ProfileMenu` modules that
`NavbarB` uses**, and the same festival shell that `NavbarA` uses. The merged preview
is a real composition of the two branches' components, not a third hand-drawn mock-up.
That is what makes the demo argument honest: the merge really did combine two things.

---

## 9. Merge resolution — how it works end to end

This section covers both what exists (Demo Mode) and how the same pipeline becomes
real in Phases 2–8.

### 9.1 The flow across frontend and backend

```
FRONTEND                              BACKEND
────────                              ───────
Dashboard
  "Compare Branches"        ──POST /api/compare──────→  ConflictService.compare()
                                                          builds Comparison
Analyzing screen            ←──── Comparison ──────────
  (4 sequenced steps)
      ↓
Conflict Overview
  2 conflicts + 1 compatible
      ↓
Visual Resolver
  Branch A preview │ Branch B preview
  AI Analysis panel
  Strategy: A / B / Combine
  Instruction textarea
  "Generate Merge"          ──POST /api/merge/plan───→  MergeService.plan()
                                                          per-conflict resolutions
                                                          → MergePlanItems
                                                          → PreviewComposition
Merge Plan                  ←──── MergePlan ───────────
  "Apply Merge"             ──POST /api/merge/apply──→  MergeService.apply()
                                                          → MergeResult
                                                          + Verification
                                                          + mock MergeRequest
Merged Result               ←──── MergeResult ─────────
  third preview
  Verification panel
  "Create Merge Request"
      ↓
Merge Candidate Ready
  PR modal
```

### 9.2 How a resolution decision actually propagates

A resolution is `{ conflictId, strategy, instruction }` where strategy is
`BRANCH_A | BRANCH_B | COMBINE`. Each conflict carries its own resolution, held in
`FlowContext`.

On **Generate Merge**, the frontend sends every conflict's resolution. The backend then
does real work with them — this is not a fixed response:

- `COMBINE` → Branch A's features **and** Branch B's features become plan items
- `BRANCH_A` → A's features kept, B's features marked `Dropped`
- `BRANCH_B` → the reverse

and it computes a `PreviewComposition` naming which variant each component should
render:

```java
navbar: variantFor(strategies.get("conflict-navbar")),   // BRANCH_A | BRANCH_B | MERGED
hero:   variantFor(strategies.get("conflict-hero")),
footer: "MERGED"
```

The frontend feeds that straight into `SitePage`, so the merged preview really is the
combination the user chose. Setting *Navbar → Use Branch A* and
*Hero → Use Branch B* produces a merged preview with no notification bell and Branch
B's hero — verified in browser tests.

### 9.3 What makes this mock today

Three things, and only three:

1. The conflicts are fabricated fixtures rather than the output of a Git merge.
2. "AI analysis" is a stored string, not a model call.
3. "Verification" is a timed animation, not a real build and browser run.

The **decision plumbing, the composition logic and the UI are real** and are designed
to be re-pointed at real data in Phase 5 without redesign.

### 9.4 How it becomes real (Phases 2–7)

**Phase 2 — real conflict detection.** Using JGit in-core:

```java
ThreeWayMerger merger = MergeStrategy.RECURSIVE.newMerger(repository, true);
boolean clean = merger.merge(branchACommit, branchBCommit);
// if not clean:
//   ResolveMerger.getMergeResults()     → per-file conflict hunks
//   ResolveMerger.getUnmergedPaths()    → conflicting file paths
//   ResolveMerger.getFailingPaths()     → delete/modify, binary, rename cases
```

`in-core = true` means the merge happens in memory against the bare clone. Nothing is
written to a working tree and nothing is committed — a genuinely non-destructive
analysis. For each conflicting path we extract the base, Branch A and Branch B blobs,
which become the real `Conflict.codeDiff`.

**`ConflictAnalysisService`** then classifies each conflict deterministically by path
and extension:

| Pattern | Category |
|---|---|
| `src/components/**`, `*.tsx`, `*.css` | `UI` |
| `src/services/**`, `src/api/**` | `FUNCTIONAL` |
| `package.json`, `pom.xml`, lockfiles | `DEPENDENCY` |
| `*.config.*`, `.env*` | `CONFIGURATION` |
| `*.json`, `*.csv` under data paths | `DATA` |
| binary / unknown | `UNKNOWN` |

Only `UI` conflicts get the visual treatment; the rest fall back to a code view. This
is an important scoping decision — VisualMerge is strongest on UI conflicts and should
be honest about the rest.

**Phase 3–4 — real running previews.** Worktrees per branch, `ProjectRuntimeDetector`
identifying React/Vite from `package.json` + `vite.config.*`, then each branch built
and served in its **own Docker container** on its own port, proxied through the
backend. `BrowserPreview` swaps its scaled React child for an iframe of the real URL —
the frame, chrome, device toggle and reload all stay.

**Phase 6 — real AI resolution.** `MergeResolutionService` sends only the relevant
context (base/A/B versions of one file, conflict markers, path, user instruction) and
requires **structured output**:

```json
{
  "resolution": "COMBINE",
  "files": [{ "path": "src/components/Navbar.tsx", "action": "MODIFY", "reason": "..." }],
  "explanation": "...",
  "confidence": 0.91
}
```

The response is validated before anything is written, and writes are confined to the
isolated workspace.

**Phase 7 — never trust generated code.** After applying: scan for leftover conflict
markers, run the project's linter/formatter if present, build, start, drive with
Playwright, capture screenshots, check for console errors. If the build fails the UI
says *"AI resolution failed verification"* and offers `Try Again` / `Edit Resolution` /
`Use Branch A` / `Use Branch B`. **A conflict is never marked resolved just because a
model returned code.**

---

## 10. Complete API reference

Base URL `http://localhost:8080`. The Vite dev server proxies `/api` so the browser
stays on one origin.

### Real repository endpoints (Phase 1 — live)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/repositories/validate` | Validate URL + confirm readable, **without cloning** |
| `POST` | `/api/repositories` | Validate, clone into isolated workspace, discover branches |
| `GET` | `/api/repositories` | List connected repositories |
| `GET` | `/api/repositories/{id}` | Repository metadata + branches |
| `GET` | `/api/repositories/{id}/branches` | Branches only |
| `POST` | `/api/repositories/{id}/refresh` | Re-read branches from the existing clone |
| `DELETE` | `/api/repositories/{id}` | Disconnect and delete the workspace |

**Example — connect**

```bash
curl -X POST http://localhost:8080/api/repositories \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/octocat/Hello-World"}'
```

```json
{
  "id": "repo_9acdb0d7ba14",
  "owner": "octocat",
  "name": "Hello-World",
  "fullName": "octocat/Hello-World",
  "webUrl": "https://github.com/octocat/Hello-World",
  "defaultBranch": "master",
  "branchCount": 3,
  "sizeKb": 3,
  "connectedAt": "2026-09-14T07:41:50Z",
  "state": "READY",
  "branches": [
    {
      "name": "master",
      "fullRef": "refs/heads/master",
      "commitId": "7fd1a60b01f91b314f59955a4e4d4e80d8edf11d",
      "shortCommitId": "7fd1a60",
      "commitMessage": "Merge pull request #6 from Spaceghost/patch-1",
      "author": "The Octocat",
      "committedAt": "2012-03-06 23:06",
      "isDefault": true
    }
  ]
}
```

Note there is **no filesystem path** in the response — that is asserted by tests.

**Error shape**

```json
{ "status": 404, "code": "REPOSITORY_NOT_FOUND",
  "message": "Repository not found: owner/name. Check the URL, or the repository may be private." }
```

### Demo Mode endpoints (mock data)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/projects` | Demo project list |
| `GET` | `/api/projects/{id}` | One project |
| `GET` | `/api/projects/{id}/conflicts` | Conflicts for a project |
| `POST` | `/api/compare` | Run a comparison → `Comparison` |
| `GET` | `/api/comparisons/{id}` | Stored comparison |
| `GET` | `/api/conflicts` · `/api/conflicts/{id}` | Conflict catalogue |
| `POST` | `/api/merge/plan` | Resolutions → `MergePlan` |
| `POST` | `/api/merge/apply` | Plan → `MergeResult` + verification |
| `GET` | `/api/merge/{id}` | Stored merge result |

### Planned endpoints (Phases 2–8)

```
POST   /api/merge-sessions                                   create session
GET    /api/merge-sessions/{id}                              session state
POST   /api/merge-sessions/{id}/analyze                      run real merge analysis
GET    /api/merge-sessions/{id}/conflicts                    real conflicts
GET    /api/merge-sessions/{id}/conflicts/{conflictId}       one conflict + versions
POST   /api/merge-sessions/{id}/conflicts/{cid}/resolve      apply A / B
POST   /api/merge-sessions/{id}/ai-resolve                   natural-language resolution
POST   /api/merge-sessions/{id}/preview/start                start branch runtimes
GET    /api/merge-sessions/{id}/previews                     preview URLs + status
POST   /api/merge-sessions/{id}/verify                       build + browser verification
POST   /api/merge-sessions/{id}/create-pr                    result branch / PR
DELETE /api/merge-sessions/{id}                              teardown
```

---

## 11. Data models

All models are **Java records** — immutable by construction.

### Real repository

```java
record GitRepository(String id, String owner, String name, String fullName,
                     String webUrl, String defaultBranch, int branchCount,
                     long sizeKb, String connectedAt, String state,
                     List<RepositoryBranch> branches)

record RepositoryBranch(String name, String fullRef, String commitId,
                        String shortCommitId, String commitMessage, String author,
                        String committedAt, boolean isDefault)
```

`GitRepository` deliberately has **no path field**. The workspace location lives in an
internal `RepositoryService.ConnectedRepository` record that is never serialised.

### Demo domain

```java
record Comparison(String id, String projectId, String baseBranch, String branchA,
                  String branchB, String createdAt, int conflictCount,
                  List<Conflict> conflicts, List<CompatibleChange> compatible,
                  List<String> analysisSteps, int filesChanged, int additions, int deletions)

record Conflict(String id, String title, String component, String type, String severity,
                String status, String description, String filePath,
                List<String> branchAChanges, List<String> branchBChanges,
                AiAnalysis analysis, CodeDiff codeDiff, String defaultInstruction)

record MergePlan(String id, String comparisonId, String projectId, String strategy,
                 String strategyLabel, String instruction, List<String> conflictIds,
                 int conflictsResolved, String summary, List<MergePlanItem> items,
                 List<String> notes, PreviewComposition preview, String createdAt)

record MergeResult(String id, String planId, String projectId, String status,
                   MergePlan plan, PreviewComposition preview,
                   Verification verification, MergeRequest mergeRequest, String createdAt)
```

### Planned — `MergeSession` (Phase 2)

The concept that ties everything together, with an explicit state machine:

```
CREATED → CLONING → READY → ANALYZING → CONFLICTS_FOUND
   → PREVIEWING → RESOLVING → BUILDING → VERIFYING
   → READY_TO_MERGE → (CLEANED_UP | FAILED)
```

Tracks: repository, base/A/B branches, workspace, conflicts, resolutions, preview
runtimes, merged candidate, verification status, timestamps, current state.

---

## 12. Security model

VisualMerge will eventually execute arbitrary code from arbitrary repositories. The
architecture treats all repository content as untrusted from the start.

### Implemented today

| Control | Implementation |
|---|---|
| No command injection | All Git access via JGit. **No shell invocation anywhere.** |
| URL allow-listing | Only `https://github.com/<owner>/<repo>` |
| Credential rejection | URLs containing userinfo are refused, so nothing is logged or stored |
| Scheme/host/port pinning | `https` only, `github.com` only, no custom ports |
| Path-traversal defence | Owner/repo match `[A-Za-z0-9][A-Za-z0-9._-]{0,99}`; deep links rejected |
| Workspace isolation | Session ids pattern-checked; every resolved path asserted under the root |
| No path disclosure | Responses carry no filesystem paths (asserted in browser tests) |
| Resource limits | Clone timeout, bounded executor, size cap, session TTL |
| No code execution | Clone is **bare** — no working tree is ever written |
| CORS pinning | Only the configured local frontend origins |
| Safe errors | User-facing message and internal cause are separate; cause is logged only |

### Required before Phase 4 (running user code)

| Control | Plan |
|---|---|
| Container isolation | One Docker container per branch runtime |
| No host filesystem access | Mount only that session's workspace subtree |
| No Docker socket | Never mounted into a container |
| Resource caps | CPU, memory, PID limits, execution timeout |
| Network restriction | Restricted egress; no access to backend internals |
| Secret isolation | No application secret or GitHub credential reachable from a container |

### Non-negotiable safety rule

**The user's original repository is never modified.** Clone, fetch and read are
allowed. Temporary branches, worktrees and merges inside the isolated workspace are
allowed. Automatic push, commits to the user's branches, force push, resetting their
local repository, and deleting their files are all forbidden. A push happens only to a
**new** `visualmerge/session-<id>` branch, only after explicit user approval, and a
pull request is never auto-merged.

---

## 13. Testing

### Backend — 45 tests, all passing

```bash
cd backend && mvn test
```

| Suite | Tests | Covers |
|---|---|---|
| `RepositoryUrlTest` | 20 | Valid forms, non-GitHub hosts, SSH/SCP, embedded credentials, non-HTTPS schemes, deep links, traversal, ports, shell metacharacters, oversized input |
| `WorkspaceServiceTest` | 15 | Per-session isolation, root containment, hostile session ids, size measurement, selective deletion, TTL sweeping, root creation |
| `GitServiceTest` | 6 | Bare clone shape, branch discovery with commit metadata, default-branch marking/sorting, ref shortening, **and that the source repository is not modified** |
| `RepositoryControllerCorsTest` | 4 | Every method the frontend uses survives CORS; unknown origins rejected |

`GitServiceTest` builds a real Git repository in a temp directory with three branches
and clones from it. **No test touches the network or any repository of the user's.**

### Frontend — browser-driven verification

Driven with Playwright against Chrome. Demo Mode: 17 steps covering the full flow
including in-preview dropdowns, mobile menu, viewport switching, code diff, both
conflicts, and the non-default strategy path. Real mode: 14 steps covering rejection
paths, real branch discovery, reload persistence, disconnect, path-leak assertion, and
that the Phase 2 button stays disabled.

### A bug this testing actually caught

`DELETE /api/repositories/{id}` returned **403** because CORS allowed only
`GET, POST, OPTIONS`, and the frontend's `catch {}` swallowed it — so every disconnect
silently leaked a workspace while the UI reported success. Instrumenting the network
log rather than assuming the 403 was an expected negative-path response found it. Both
sides were fixed and `RepositoryControllerCorsTest` now guards it.

---

## 14. Running the project

### Prerequisites

- JDK 21+ (tested on JDK 25)
- Maven 3.9+
- Node.js 20+

### Backend

```bash
cd backend
mvn spring-boot:run          # http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Open http://localhost:5173.

### Try it

**Real mode:** Dashboard → *Connect Repository* → paste
`https://github.com/octocat/Hello-World` → see three real branches with real commits.

**Demo mode:** Dashboard → *Compare Branches* → walk the full resolution flow. Open the
notification tray inside the Branch B preview, switch to Mobile and open Branch A's
hamburger menu, set Navbar → Branch A and Hero → Branch B and watch the merged preview
change.

---

## 15. Roadmap — Phases 2 to 8

### Phase 2 — Real merge analysis *(next)*

Introduce `MergeSession`. Resolve the merge base, run JGit `ResolveMerger` in-core,
extract real conflicts (path, type, text/binary, base/A/B blobs, conflict hunks),
classify them with `ConflictAnalysisService`. Handle delete/modify, binary and rename
cases. Endpoints: `POST /api/merge-sessions`, `POST /{id}/analyze`, `GET /{id}/conflicts`.
Non-destructive throughout: nothing written, nothing committed.

### Phase 3 — Isolated workspaces

Per-session worktrees: `base/`, `branch-a/`, `branch-b/`, `merge-candidate/`. Extends
`WorkspaceService`. Real file trees per branch, ready to build.

### Phase 4 — Runtime detection and Docker previews

`ProjectRuntimeDetector` identifies React/Vite (`package.json`, `vite.config.*`,
`src/`) and returns framework, build command, dev command and port.
`SandboxService` + `ProjectRuntimeService` run each branch in its own container
(e.g. A on 41001, B on 41002, merged on 41003), proxied through the backend.
`BrowserPreview` renders the real URL. Failure states are explicit:
*"Branch A could not be started"* plus the high-level reason — never a stack trace.

### Phase 5 — Resolver on real data

Point the existing resolver UI at real conflicts and real preview URLs. `Use Branch A`
and `Use Branch B` become real file-level resolutions written into the merge-candidate
workspace. Component-level mapping (`src/components/Navbar.tsx` → "Navbar") via path
and component-name conventions.

### Phase 6 — AI-assisted resolution

`MergeResolutionService` with strictly scoped context, structured and validated output,
writes confined to the workspace. Natural-language instructions drive real code changes.

### Phase 7 — Merged candidate and real verification

Build and run the resolved project. Playwright verification: page loads, no unresolved
conflict markers in source, build succeeds, primary route loads, screenshots captured,
console errors and failed requests detected. Real pass/fail only — a check that did not
run is never reported as passed.

### Phase 8 — Result branch and pull request

Push the verified result to a **new** `visualmerge/session-<id>` branch only after
explicit approval, then optionally open a PR into base. Never auto-merge. Requires
GitHub authentication (token or OAuth), kept behind a clear integration boundary.

### Beyond Phase 8

Private repositories via OAuth, additional frameworks (Next.js, Vue, Angular, Spring
Boot, Node, Python), AI-assisted conflict classification and source-to-DOM mapping,
true pixel-level visual diffing, team accounts and shared sessions, CI integration.

---

## 16. Cloud database plan

### Where state lives today

There is **no database**. No JPA, no JDBC, no `DataSource`, no `@Entity` — verified
across the codebase.

| Location | Holds | Lifetime |
|---|---|---|
| `RepositoryService` map | Connected repos → workspace paths | Until JVM restart |
| `ConflictService` map | Demo comparisons | Until JVM restart |
| `MergeService` maps | Demo plans and results | Until JVM restart |
| Filesystem workspace | Cloned Git data | Until disconnect or TTL |
| Browser `sessionStorage` | Repo id, demo flow state | Until tab closes |

This was deliberate: the original brief excluded PostgreSQL, and Phase 1 needs no
persistence.

### Why it must change

| Trigger | Consequence today |
|---|---|
| Backend restart | Every connected repository is lost; workspace directories become orphans until the TTL sweeper clears them |
| More than one instance | Session created on instance A is invisible to instance B — no horizontal scaling |
| Phase 6 AI resolutions | Real work (generated code, decisions, instructions) would be lost on restart |
| Phase 7 verification runs | No history of what passed, when, or why |
| Accounts / teams | Impossible without durable identity |

### Recommended target

**PostgreSQL**, managed. Best fits for this project:

| Option | Why | Watch out for |
|---|---|---|
| **Neon** *(recommended)* | Serverless Postgres, generous free tier, scale-to-zero, branch-per-environment | Cold start on first query after idle |
| **Supabase** | Postgres + auth + storage; auth is useful when accounts arrive | More product surface than needed initially |
| **AWS RDS / Aurora** | Standard for production scale | Heavier setup, cost, VPC configuration |

Neon or Supabase gives a cloud database with no infrastructure work, which suits this
project's stage.

### Proposed schema

```sql
CREATE TABLE repository (
    id              UUID PRIMARY KEY,
    owner           TEXT        NOT NULL,
    name            TEXT        NOT NULL,
    full_name       TEXT        NOT NULL,
    web_url         TEXT        NOT NULL,
    default_branch  TEXT        NOT NULL,
    size_kb         BIGINT      NOT NULL,
    connected_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_fetched_at TIMESTAMPTZ,
    UNIQUE (full_name)
);

CREATE TABLE merge_session (
    id             UUID PRIMARY KEY,
    repository_id  UUID        NOT NULL REFERENCES repository(id) ON DELETE CASCADE,
    base_branch    TEXT        NOT NULL,
    branch_a       TEXT        NOT NULL,
    branch_b       TEXT        NOT NULL,
    state          TEXT        NOT NULL,   -- CREATED … CLEANED_UP
    workspace_key  TEXT        NOT NULL,   -- opaque key, NOT an absolute path
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ,
    error_code     TEXT,
    error_message  TEXT
);
CREATE INDEX ON merge_session (state, expires_at);

CREATE TABLE conflict (
    id             UUID PRIMARY KEY,
    session_id     UUID NOT NULL REFERENCES merge_session(id) ON DELETE CASCADE,
    file_path      TEXT NOT NULL,
    conflict_type  TEXT NOT NULL,   -- CONTENT | DELETE_MODIFY | BINARY | RENAME
    category       TEXT NOT NULL,   -- UI | FUNCTIONAL | LOGIC | STYLING | …
    is_binary      BOOLEAN NOT NULL DEFAULT false,
    component_name TEXT,
    severity       TEXT,
    status         TEXT NOT NULL,   -- UNRESOLVED | RESOLVED | FAILED
    UNIQUE (session_id, file_path)
);

-- Large blobs kept separate so conflict listings stay cheap to query.
CREATE TABLE conflict_content (
    conflict_id      UUID PRIMARY KEY REFERENCES conflict(id) ON DELETE CASCADE,
    base_content     TEXT,
    branch_a_content TEXT,
    branch_b_content TEXT,
    conflict_markers TEXT
);

CREATE TABLE resolution (
    id            UUID PRIMARY KEY,
    conflict_id   UUID NOT NULL REFERENCES conflict(id) ON DELETE CASCADE,
    strategy      TEXT NOT NULL,   -- BRANCH_A | BRANCH_B | COMBINE | MANUAL
    instruction   TEXT,
    resolved_code TEXT,
    ai_model      TEXT,
    ai_confidence NUMERIC(4,3),
    applied_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verification_run (
    id            UUID PRIMARY KEY,
    session_id    UUID NOT NULL REFERENCES merge_session(id) ON DELETE CASCADE,
    build_status  TEXT NOT NULL,   -- PASSED | FAILED | SKIPPED
    checks        JSONB NOT NULL,  -- per-check real results
    screenshots   JSONB,           -- object-storage keys, not image bytes
    console_errors JSONB,
    started_at    TIMESTAMPTZ NOT NULL,
    finished_at   TIMESTAMPTZ
);
```

### Migration path — low risk

The service layer is already **the only code that touches state**, so the change is
contained and no controller is affected.

```
Today                          After
─────                          ─────
RepositoryService              RepositoryService
  ConcurrentHashMap    ──→       RepositoryRepository (Spring Data JPA)
MergeService                   MergeService
  ConcurrentHashMap    ──→       MergeSessionRepository
```

Steps:

1. Add `spring-boot-starter-data-jpa`, `postgresql`, `flyway-core`.
2. Write `V1__initial_schema.sql` as a Flyway migration.
3. Add `@Entity` classes mirroring the existing records (keep the records as API DTOs
   so responses do not change shape).
4. Replace each map with a Spring Data repository — behind the existing service methods.
5. Keep an `application-local.properties` profile on H2 file mode for offline work.

### Configuration (secrets never committed)

```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USER}
spring.datasource.password=${DATABASE_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate     # Flyway owns the schema, never Hibernate
spring.flyway.enabled=true
spring.datasource.hikari.maximum-pool-size=10
```

### Rules for what goes in the database

| Store | Never store |
|---|---|
| Session metadata and state | GitHub tokens in plaintext (use a secret manager; store references) |
| Conflict paths, categories, status | Whole repositories (they belong in the workspace/object storage) |
| Conflict file contents (bounded size) | Absolute filesystem paths (store opaque workspace keys) |
| Resolutions and AI metadata | Raw AI prompts containing private source beyond retention need |
| Verification results | Screenshot bytes (use object storage, keep keys) |

### Important caveat

A cloud database stores **metadata**, not workspaces. Cloned repositories and running
containers stay node-local. Horizontal scaling therefore needs either session affinity
or a shared volume — a genuine design decision for Phase 4 and beyond, not something a
database alone solves.

---

## 17. Deployment and infrastructure plan

Nothing is deployed today; everything runs locally. The eventual shape:

| Concern | Plan |
|---|---|
| Frontend | Static build on Vercel/Netlify/S3+CloudFront |
| Backend | Containerised Spring Boot on a host that can run Docker (Fly.io, Render, ECS, or a VM) |
| Runtime sandboxes | Docker-in-host with strict resource limits; Kubernetes Jobs only if scale demands it |
| Database | Managed Postgres (section 16) |
| Object storage | S3-compatible for screenshots and build artefacts |
| Secrets | Platform secret manager — never in `application.properties` |
| Observability | Structured logs already in place; add metrics and tracing per session |
| CI | Build + test both projects on every push; block on failing tests |

Serverless platforms are a poor fit for the backend because sessions need local
workspaces and long-lived container runtimes.

---

## 18. Known limitations

### Phase 1 (real mode)

- **Public repositories only.** Private needs authentication; the URL parser rejects
  embedded credentials by design.
- GitHub answers anonymous requests for a missing repository and a private one
  identically, so both surface as `REPOSITORY_NOT_FOUND` with a message naming the
  private case. Genuinely indistinguishable, not a shortcut.
- The size cap is enforced **after** cloning, so an oversized repository is downloaded
  before rejection. The clone timeout is the practical guard.
- A force-killed backend skips the JVM shutdown hook, so workspaces survive until the
  TTL sweeper runs.
- No persistence — a restart drops connected repositories.

### Demo Mode

- Conflicts, AI analysis and verification are fixtures. Clearly labelled; never
  presented as real.
- The simulated website is one page; there is no routing inside the preview.

### Cross-cutting

- No authentication or user accounts.
- Single-node only.
- GitHub only; no GitLab or Bitbucket.

---

## 19. Decision log

| Decision | Reasoning |
|---|---|
| **JGit over shelling out to `git`** | No shell means no command-injection surface from user input; no dependency on a `git` binary; Phase 2 gets `ResolveMerger` conflict hunks as structured data |
| **Bare clone** | Small and fast, and no working tree means no repository file is ever written in executable form |
| **`ls-remote` before cloning** | Validates existence and access without downloading anything |
| **Two separate API clients** | Makes "the real flow never fakes success" structural rather than a convention |
| **Models carry no filesystem paths** | Path disclosure is prevented by the type, not by remembering to strip fields |
| **Records everywhere** | Immutability by construction; no accidental shared mutable state |
| **Virtual viewport + transform scale** | The only way a desktop site reads correctly inside a small panel |
| **`compact` prop instead of CSS breakpoints in previews** | Media queries key off the real window, not the virtual viewport |
| **Phase 2 button visible but disabled** | Honesty is a product feature; an unavailable capability must never be simulated |
| **No database yet** | Was explicitly out of scope; the service layer is structured so adding one is contained |
| **Demo Mode kept alongside real mode** | Proves the full experience while the real pipeline is built phase by phase |

---

*VisualMerge — resolve conflicts by seeing the result, not reading the diff.*
