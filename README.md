# VisualMerge

**Resolve conflicts by seeing the result, not reading the diff.**

VisualMerge is an AI-assisted visual merge resolver for people who ship UI without wanting to
read conflict markers. Instead of showing you this:

```
<<<<<<< HEAD
code from branch A
=======
code from branch B
>>>>>>> branch B
```

…it shows you **Version A running**, **Version B running**, an **AI explanation** of what each
branch changed, and lets you say what you want in plain English:

> “Keep the animated Ganpati navbar from Branch A, but keep the notification and profile menus
> from Branch B.”

VisualMerge then composes the merge, renders the **merged version running**, verifies it
visually, and hands you a merge candidate.

---

## Two modes

VisualMerge now has two distinct modes, and they never mix.

**Real Repository** — connect a public GitHub repository by URL. It is cloned into an isolated
workspace, and its real branches are discovered and shown. This path **never** falls back to mock
data: if an operation fails you see the actual failure, and anything not yet implemented is
labelled unavailable rather than simulated.

**Demo Mode** — the original CauseKind walkthrough on built-in sample data, which shows the whole
resolution experience end to end (conflict overview, visual resolver, AI analysis, merge plan,
merged preview, verification). Everything in Demo Mode is mock data and is labelled as such.

### Implementation phases

Real-repository support is being built in phases. **Phase 1 is complete.**

| Phase | Scope | State |
| ----- | ----- | ----- |
| 1 | Public GitHub URL → validate → clone → discover real branches | **Done** |
| 2 | Real three-way merge analysis and conflict detection | Not started |
| 3 | Isolated per-branch worktrees | Not started |
| 4 | React/Vite detection + Docker runtimes + real branch previews | Not started |
| 5 | Resolver UI wired to real conflicts | Not started |
| 6 | AI-assisted resolution | Not started |
| 7 | Merged candidate build + browser verification | Not started |
| 8 | Result branch / pull request | Not started |

Phases 2–8 are deliberately absent rather than stubbed. The **Start Merge Analysis** button is
visible but disabled, with the reason stated in the UI.

### Safety

The user's repository is only ever **read**. VisualMerge clones into a temporary workspace it owns
and works only there. It never pushes, never commits to your branches, never touches your local
checkout, and never deletes anything outside its own workspace. Disconnecting removes the
workspace; abandoned workspaces are swept on a TTL.

Everything else in this prototype — conflicts, merges, previews, verification, pull requests — is
still mock data in Demo Mode.

---

## Running it

Two processes. Backend first.

### Backend — Spring Boot (port 8080)

```bash
cd backend
mvn spring-boot:run
```

Requires JDK 21+ (built and tested on JDK 25, compiled with `--release 21`) and Maven 3.9+.

### Frontend — Vite + React (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

The Vite dev server proxies `/api` to `http://localhost:8080`, so both run on one origin in the
browser. If the backend is not running, **Demo Mode** transparently falls back to bundled mock
data and shows an **“Offline mock data”** chip in the header, so the walkthrough always completes.
**Real Repository mode never falls back** — it needs the backend and reports the real failure.

---

## The flow

```
Dashboard → Compare Branches → Analyzing → Conflict Overview → Visual Resolver
   → AI Analysis → Your Instruction → Generate Merge → Merge Plan → Apply Merge
   → Merged Browser Preview → Visual Verification → Merge Ready → Merge Request
```

Both detected conflicts (**Navbar** and **Hero Section**) are fully playable, each with its own
previews, AI analysis, and decision. Every button is wired; there are no dead ends.

### Things worth trying in the demo

- Open the **notification tray** and **profile menu** inside the Branch B preview — they work.
- Switch the previews to **Mobile** and open Branch A's hamburger menu.
- Scroll inside a preview; hit the **reload** button in the browser chrome.
- Set **Navbar → Use Branch A** and **Hero Section → Use Branch B**, then generate: the merge
  plan strikes out the dropped features and the merged preview really is that combination.
- **View Code Diff** — the code exists, but it is deliberately a secondary, optional view.

---

## Architecture

```
VisualMergeResolver/
├── backend/                                   Spring Boot 3.5 · Java 21 · Maven
│   └── src/main/java/com/visualmerge/
│       ├── VisualMergeApplication.java
│       ├── config/       WebConfig (CORS), ApiExceptionHandler, WorkspaceProperties
│       ├── git/          RepositoryUrl (trust boundary), GitService (JGit),
│       │                 GitOperationException                         ← real repositories
│       ├── model/        GitRepository, RepositoryBranch               ← real repositories
│       │                 Project, Branch, Conflict, AiAnalysis, Comparison,
│       │                 MergePlan, MergeResult, Verification, MergeRequest…  (demo)
│       ├── dto/          ConnectRepositoryRequest, ValidateRepositoryResponse,
│       │                 ApiErrorResponse, CompareRequest, MergePlanRequest…
│       ├── service/      RepositoryService, WorkspaceService           ← real repositories
│       │                 ProjectService, ConflictService, MergeService (demo, in-memory)
│       └── controller/   RepositoryController                          ← real repositories
│                         ProjectController, ConflictController, MergeController (demo)
│
└── frontend/                                  React 19 · TypeScript · Vite · Tailwind v4
    └── src/
        ├── components/          BranchSelect                           ← real repositories
        │                        BrowserPreview, ConflictCard, BranchBadge, StatusBadge,
        │                        ProgressSteps, AIAnalysisPanel, InstructionPanel,
        │                        MergePlanPanel, VerificationPanel, AiThinking,
        │                        CodeDiffModal, MergeRequestModal, AppShell, ui, Icons
        ├── components/preview/  The previewed CauseKind site itself:
        │                        navbars (A / B / merged), heroes (A / B / merged),
        │                        menus, navbarParts, sections, marks, SitePage
        ├── pages/               ConnectRepository                      ← real repositories
        │                        Dashboard, Analyzing, ConflictOverview,
        │                        ConflictResolver, MergeResultPage      (demo)
        ├── state/               FlowContext (comparison, per-conflict resolutions, plan, result)
        ├── services/
        │   ├── repositoryApi.ts REST client for real repositories — never falls back
        │   └── api.ts           Demo REST client, falls back to mock data
        ├── data/mockData.ts     Bundled mirror of the backend's demo data
        ├── lib/                 hooks (viewport scaling, step sequences), utils
        └── types/
```

### How the previews work

Each preview renders a **fixed-width virtual viewport** (1280px desktop, 390px mobile) inside a
browser-chrome frame, then scales it to fit with a `ResizeObserver`. That is why the previews
read as real desktop websites rather than narrow columns, and why scrolling, dropdowns, and the
mobile menu all behave normally inside them.

The three navbars and three heroes are separate components. The merged navbar literally imports
`NotificationMenu` and `ProfileMenu` from Branch B's module and the festival shell from Branch
A's — the merged preview is genuinely composed, not a third mock-up.

---

## Demo Mode API

These endpoints back the CauseKind walkthrough and return mock JSON; state lives in memory for
the lifetime of the process. The real-repository endpoints are documented further down.

| Method | Endpoint                        | Purpose                                        |
| ------ | ------------------------------- | ---------------------------------------------- |
| GET    | `/api/projects`                 | List demo projects                             |
| GET    | `/api/projects/{id}`            | One project                                    |
| GET    | `/api/projects/{id}/conflicts`  | Conflicts for a project                        |
| POST   | `/api/compare`                  | Run a branch comparison → `Comparison`         |
| GET    | `/api/comparisons/{id}`         | Fetch a stored comparison                      |
| GET    | `/api/conflicts` · `/{id}`      | Conflict catalogue                             |
| POST   | `/api/merge/plan`               | Per-conflict resolutions → `MergePlan`         |
| POST   | `/api/merge/apply`              | Approved plan → `MergeResult` + verification   |
| GET    | `/api/merge/{id}`               | Fetch a stored merge result                    |

`POST /api/merge/plan` accepts a `resolutions` array (`conflictId`, `strategy` of
`BRANCH_A` / `BRANCH_B` / `COMBINE`, `instruction`). The strategy genuinely drives the plan
items, the dropped features, and which variant of each component the merged preview renders.

---

## Real repository API (Phase 1)

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| POST | `/api/repositories/validate` | Validate a URL and confirm the repository is readable, without cloning |
| POST | `/api/repositories` | Validate, clone into an isolated workspace, discover branches |
| GET | `/api/repositories` | List currently connected repositories |
| GET | `/api/repositories/{id}` | Repository metadata and branches |
| GET | `/api/repositories/{id}/branches` | Branches only |
| POST | `/api/repositories/{id}/refresh` | Re-read branches from the existing clone |
| DELETE | `/api/repositories/{id}` | Disconnect and delete the temporary workspace |

Errors carry a stable code and a message written for a person — never a stack trace or a
filesystem path: `INVALID_URL`, `REPOSITORY_NOT_FOUND`, `REPOSITORY_INACCESSIBLE`,
`REPOSITORY_TOO_LARGE`, `CLONE_FAILED`, `CLONE_TIMEOUT`, `NO_BRANCHES`, `UNKNOWN_REPOSITORY`,
`WORKSPACE_ERROR`.

### How it works

All Git access goes through **JGit** — there is no shelling out, so no user-supplied text is ever
interpreted as a command. `RepositoryUrl` is the trust boundary: only
`https://github.com/<owner>/<repo>` is accepted, embedded credentials, SSH URLs, other hosts,
ports, deep links and traversal attempts are all rejected, and the clone URL is rebuilt from the
parsed parts rather than the raw input.

Validation uses `ls-remote`, which confirms the repository exists and is readable without
downloading anything. The clone itself is **bare** — objects and refs, no working tree — so
nothing from the repository is ever written as executable files or run. It lands in

```
<workspace-root>/session-<id>/repository
```

where the root defaults to `${java.io.tmpdir}/visualmerge-workspaces` and is configurable via
`visualmerge.workspace.root`. Session ids are pattern-checked and every resolved path is verified
to sit under the root, so a malformed id cannot escape. Clones run on a bounded executor with a
timeout, and a repository over `visualmerge.workspace.max-repository-size-mb` is deleted and
rejected.

### Configuration

```properties
visualmerge.workspace.root=${java.io.tmpdir}/visualmerge-workspaces
visualmerge.workspace.clone-timeout-seconds=120
visualmerge.workspace.max-repository-size-mb=500
visualmerge.workspace.session-ttl-minutes=120
visualmerge.workspace.cleanup-on-shutdown=true
```

### Known limitations

- Public repositories only. Private repositories need authentication (planned via token/OAuth);
  the URL parser rejects embedded credentials by design.
- GitHub answers anonymous requests for a missing repository and a private one identically, so
  both surface as `REPOSITORY_NOT_FOUND` with a message that mentions the private case.
- The size cap is enforced *after* cloning, so an oversized repository is downloaded before being
  rejected. The clone timeout is the practical guard.
- A force-killed backend skips the shutdown hook, so workspaces survive until the TTL sweeper runs.

### Tests

```bash
cd backend && mvn test
```

45 tests covering URL validation and rejection, workspace isolation and path-traversal defence,
TTL sweeping, clone and branch discovery against a Git repository built in a temp directory, and
the CORS methods the frontend depends on. No test touches the network or any repository of yours.

## Verified

The complete flow was driven end-to-end in Chrome with zero console or page errors, in both
API-connected and offline-fallback modes, including the in-preview interactions (dropdowns,
mobile menu, viewport switching) and the non-default per-conflict strategy path.
