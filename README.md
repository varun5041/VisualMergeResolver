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

## Prototype scope

This is a **product prototype**. It proves the experience, not the plumbing.

There is deliberately **no** Git integration, GitHub OAuth/API, JGit, database, auth, real LLM
call, real code modification, sandbox execution, browser automation, or deployment infra. All
data is realistic mock data served from Spring Boot, and the three “websites” in the previews
are real React components rendered live in the page.

Demo repository: **CauseKind** · base `main` · Branch A `ganpati-theme` · Branch B `navbar-feature`

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
browser. If the backend is not running, the frontend transparently falls back to bundled mock
data and shows an **“Offline mock data”** chip in the header — the demo always completes.

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
│       ├── config/       WebConfig (CORS), ApiExceptionHandler
│       ├── model/        Project, Branch, Conflict, AiAnalysis, Comparison,
│       │                 MergePlan, MergeResult, Verification, MergeRequest…
│       ├── dto/          CompareRequest, MergePlanRequest, MergeApplyRequest, ApiError
│       ├── service/      ProjectService, ConflictService, MergeService  (in-memory, no DB)
│       └── controller/   ProjectController, ConflictController, MergeController
│
└── frontend/                                  React 19 · TypeScript · Vite · Tailwind v4
    └── src/
        ├── components/          BrowserPreview, ConflictCard, BranchBadge, StatusBadge,
        │                        ProgressSteps, AIAnalysisPanel, InstructionPanel,
        │                        MergePlanPanel, VerificationPanel, AiThinking,
        │                        CodeDiffModal, MergeRequestModal, AppShell, ui, Icons
        ├── components/preview/  The previewed CauseKind site itself:
        │                        navbars (A / B / merged), heroes (A / B / merged),
        │                        menus, navbarParts, sections, marks, SitePage
        ├── pages/               Dashboard, Analyzing, ConflictOverview,
        │                        ConflictResolver, MergeResultPage
        ├── state/               FlowContext (comparison, per-conflict resolutions, plan, result)
        ├── services/api.ts      REST client with mock fallback
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

## API

All endpoints return mock JSON; state lives in memory for the lifetime of the process.

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

## Verified

The complete flow was driven end-to-end in Chrome with zero console or page errors, in both
API-connected and offline-fallback modes, including the in-preview interactions (dropdowns,
mobile menu, viewport switching) and the non-default per-conflict strategy path.
