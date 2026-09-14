# VisualMerge

**Resolve conflicts by seeing the result, not reading the diff.**

VisualMerge is a visual merge resolver for people who ship UI and would rather not read conflict
markers. The goal is to show you **Branch A running**, **Branch B running**, and a **merged result
you approve before it becomes a commit**.

This README describes what the code actually does today. Nothing below is aspirational, and the
application ships with no demo repository, no sample branches and no seeded activity: an account
with nothing in it shows empty states.

---

## What works today

| Capability | Status |
| ---------- | ------ |
| Sign in with GitHub (OAuth2, server-side) | Working |
| One GitHub account maps to exactly one VisualMerge user | Working |
| List the repositories your GitHub account can reach | Working |
| List a repository's real branches | Working |
| Create a merge session, validated against GitHub and stored in MySQL | Working |
| Sessions survive a refresh, a sign-out and a restart | Working |
| Clone a public repository into an isolated workspace (JGit) | Working, not yet wired to sessions |
| Building and rendering the two branches | Not built |
| Conflict detection, AI resolution, verification, pull requests | Not built |

The comparison engine is the next milestone. Until it exists, a merge session page says so rather
than showing conflicts that were never computed.

---

## Running it

### Prerequisites

- JDK 21 or newer
- Node 20 or newer
- A MySQL 8 database (the project runs against Aiven)
- A GitHub OAuth App

### 1. Configure the backend

Create `backend/.env` (git-ignored, never commit it):

```bash
AIVEN_DB_URL=jdbc:mysql://<host>:<port>/<database>
AIVEN_DB_USER=<user>
AIVEN_DB_PASSWORD=<password>

GITHUB_CLIENT_ID=<oauth app client id>
GITHUB_CLIENT_SECRET=<oauth app client secret>
```

`DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` are also accepted for
deployments that supply the parts separately. `AIVEN_DB_URL` wins when both are present. TLS is
required on the datasource, which is what Aiven expects.

Your GitHub OAuth App needs this **Authorization callback URL**:

```
http://localhost:8080/login/oauth2/code/github
```

### 2. Start both halves

```bash
cd backend  && mvn spring-boot:run     # http://localhost:8080
cd frontend && npm install && npm run dev   # http://localhost:5173
```

Open `http://localhost:5173` and choose **Continue with GitHub**. The Vite dev server proxies
`/api` to the backend, so the browser stays on one origin.

### GitHub scopes

The default scope set is `read:user,user:email,repo`.

`repo` is what lets VisualMerge see **private** repositories and read their branches. GitHub OAuth
Apps have no read-only variant of it, so the grant is broader than what VisualMerge does, which is
read. To limit it to public repositories, set:

```bash
GITHUB_SCOPES=read:user,user:email
```

The private/public filter then simply finds nothing private. Changing scopes means GitHub will ask
you to authorize the app again.

---

## API

Every endpoint requires a session. Unauthenticated requests get `401` with a JSON body, never a
redirect, so the frontend can react to it.

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/api/auth/me` | The signed-in VisualMerge user, from MySQL |
| POST | `/api/auth/logout` | End the session |
| GET | `/api/github/repositories` | Repositories this GitHub account can reach |
| GET | `/api/github/repositories/{owner}/{repo}` | One repository |
| GET | `/api/github/repositories/{owner}/{repo}/branches` | That repository's branches |
| POST | `/api/merge-sessions` | Create a session after validating it against GitHub |
| GET | `/api/merge-sessions` | Your sessions, newest first |
| GET | `/api/merge-sessions/stats` | Dashboard counters, all real counts |
| GET | `/api/merge-sessions/{id}` | One session, owner only |

Plus the workspace endpoints under `/api/repositories/**`, which clone a public repository with
JGit. They are real and tested, and are the foundation the comparison engine will build on.

### Errors

One shape everywhere:

```json
{ "status": 404, "code": "BRANCH_NOT_FOUND", "message": "Branch \"develop\" does not exist in acme/site." }
```

`UNAUTHENTICATED`, `GITHUB_AUTHORIZATION_REQUIRED`, `GITHUB_RATE_LIMITED`, `GITHUB_UNREACHABLE`,
`REPOSITORY_NOT_FOUND`, `REPOSITORY_FORBIDDEN`, `BRANCH_NOT_FOUND`, `INVALID_BRANCH_SELECTION`,
`MERGE_SESSION_NOT_FOUND`, `MERGE_SESSION_FORBIDDEN`, `DATABASE_UNAVAILABLE`, `INTERNAL_ERROR`.

Causes are logged on the server and never sent to the client, so no stack trace, filesystem path or
connection string can leave through a response.

---

## How identity works

GitHub's **numeric user id** is the identity, not the username and not the email. People rename
themselves on GitHub and hide their addresses, and both of those must leave the account intact.

On every sign-in, `UserService.upsertFromGitHub` looks up the row by `github_id` and refreshes the
profile fields GitHub owns. Signing in twice updates one row; it never creates a second.

Accounts created before `github_id` existed are adopted by email on their next sign-in, once, and
identified by GitHub id forever after.

The GitHub access token lives in Spring Security's server-side authorized-client store for the
length of the session. It is never written to the database, never put in a response body and never
reaches the browser, which holds only a session cookie. Because that store is in memory, restarting
the backend asks you to sign in again rather than showing stale data.

---

## Data model

```
users                 id, github_id (unique), github_username, name, email, avatar_url,
                      github_connected, created_at, updated_at

repositories          id, github_repository_id (unique), owner, name, full_name,
                      private_repository, default_branch, html_url, created_at, updated_at

user_repositories     user_id, repository_id, linked_at        (many-to-many)

merge_sessions        id, user_id, repository_id, base_branch, branch_a, branch_b,
                      status, conflicts_count, created_at, updated_at
```

`repositories` is a catalogue, not a cache. A row appears when a repository is actually used, which
today means a merge session was created against it. Browsing the dashboard or the repositories page
writes nothing: those read GitHub directly, so nobody's repository list gets copied into MySQL.

`user_repositories` records **which users have worked with which repositories**. It is deliberately
not an access-control record. GitHub remains the authority on who may read a repository, and every
request that needs access re-checks there, so revoking VisualMerge on GitHub revokes it here.

`status` is the `MergeSessionStatus` enum: `CREATED`, `FETCHING`, `COMPARING`, `CONFLICTS_FOUND`,
`NO_CONFLICTS`, `RESOLVING`, `VERIFYING`, `COMPLETED`, `FAILED`. Only `CREATED` is reachable until
the comparison engine lands.

`conflicts_count` is null until something has been compared, which is deliberately different from
zero, meaning "compared, found nothing".

### Migrations

Flyway owns the schema; Hibernate runs with `ddl-auto=validate`, so a mapping that disagrees with
the database fails at startup instead of quietly altering it.

| Version | What it does |
| ------- | ------------ |
| `V1` | Baseline of the shape `ddl-auto=update` had already created |
| `V2` | GitHub identity, `repositories`, `user_repositories`, real merge session columns |
| `V3` | Drops the unique key on `users.email`, which stopped being an identity |

The existing database is baselined on first run (`spring.flyway.baseline-on-migrate=true`), so
migrations were adopted without dropping anything. No migration deletes a user.

---

## Creating a merge session

`POST /api/merge-sessions`

```json
{
  "owner": "acme",
  "repository": "site",
  "baseBranch": "main",
  "branchA": "feature/nav",
  "branchB": "feature/cards"
}
```

Nothing is written until all of this holds:

- the session is authenticated, and the user row exists
- the repository exists **and** this GitHub account can see it — GitHub answers 404 for
  repositories a token may not read, so one lookup proves both
- all three branches exist on GitHub right now
- Branch A and Branch B are different

Only then does a row reach MySQL, so the database never holds a session pointing at branches that
were never there.

Reading a session back is restricted to the account that created it. Another account gets `403`,
which is logged.

---

## Repository layout

```
backend/src/main/java/com/visualmerge/
  config/      SecurityConfig, WebConfig, ApiExceptionHandler
  controller/  AuthController, GitHubController, MergeSessionController, RepositoryController
  dto/         request and response records
  exception/   ApiException and the failures the API deliberately raises
  git/         GitService, RepositoryUrl, GitOperationException   (JGit, no shelling out)
  model/       User, Repository, UserRepositoryLink, MergeSession, MergeSessionStatus
  repository/  Spring Data JPA interfaces
  security/    CustomOAuth2UserService, CurrentUser
  service/     GitHubService, UserService, RepositoryCatalogService,
               MergeSessionService, RepositoryService, WorkspaceService

backend/src/main/resources/db/migration/   Flyway migrations

frontend/src/
  components/  Shared UI, including the loading / empty / error states
  contexts/    AuthContext, backed only by GET /api/auth/me
  layouts/     PublicLayout, AppLayout
  lib/         useAsync, formatting helpers
  pages/       Landing, Login, Dashboard, Repositories, NewMerge, MergeSession, Settings
  services/    http.ts (never falls back to bundled data), visualMergeApi.ts
  types/       API response types
```

GitHub access lives in `GitHubService` and nowhere else. Database access lives in the JPA
repositories. Controllers translate HTTP and do no work of their own.

---

## Frontend behaviour

There are no `MOCK_*` constants and no offline fallback. `services/http.ts` throws an `ApiError`
carrying the backend's code and message, and every screen renders one of four states: loading,
success, empty, or error. A failure is shown where it happened, with what went wrong and a way
forward. Nothing silently redirects to the dashboard.

Identity is never hardcoded. Name, username, email and avatar all come from `GET /api/auth/me`.

### Motion

The landing page uses GSAP with ScrollTrigger, in `lib/motion.ts` and `components/motion.tsx`.
Three rules hold everywhere:

- Only `transform` and `opacity` are animated, so tweens stay on the compositor. The one exception
  is `stroke-dashoffset` in the merge diagram, which repaints a small SVG and never reflows.
- Continuous pointer and scroll values never touch React state. They go through `gsap.quickTo`,
  which writes straight to the element instead of re-rendering on every frame.
- Everything sits inside `gsap.matchMedia`, so `prefers-reduced-motion` gets the finished layout
  immediately. Hover effects additionally require `pointer: fine`.

Markup always renders the finished state; the starting state is set by the animation itself. With
JavaScript off, or motion turned down, the page is complete and readable rather than blank.

Exactly one section pins (the merge diagram). GSAP is code-split out of the app shell, so it loads
on `/` only and never on an authenticated route.

---

## Security

- Every `/api` route requires a session. Only the OAuth handshake and CORS preflight are open.
- Unauthenticated API calls get a `401` JSON body rather than a redirect to GitHub, which a browser
  would otherwise report as an opaque CORS failure.
- The GitHub token never leaves the server. No secret is in any frontend file.
- Database credentials come from the environment. `backend/.env` is git-ignored.
- A merge session is readable only by the account that created it.
- All Git access goes through JGit, so no user-supplied text is interpreted as a command.
  `RepositoryUrl` accepts only `https://github.com/<owner>/<repo>` and rejects embedded
  credentials, SSH URLs, other hosts, ports, deep links and traversal.
- CSRF protection is **disabled** for local development. Turn it back on before exposing this to
  anything but localhost.

---

## Tests

```bash
cd backend && mvn test
```

66 tests:

- `UserServiceTest` — one GitHub account is one user; a second sign-in updates rather than
  duplicates; a renamed account keeps its row; a pre-GitHub account is adopted once and not stolen;
  a profile with no name and no email still works.
- `MergeSessionServiceTest` — a session is created only when the repository and all three branches
  exist; identical branches, a missing branch and an invisible repository are each rejected before
  anything is written; a session is readable by its owner and refused to anyone else.
- `GitServiceTest`, `RepositoryUrlTest`, `WorkspaceServiceTest`, `RepositoryControllerCorsTest` —
  URL validation, workspace isolation and path-traversal defence, TTL sweeping, clone and branch
  discovery against a repository built in a temp directory, and the CORS methods the frontend needs.

No test touches the network or any repository of yours.

```bash
cd frontend && npm run build   # type-check and production build
npx oxlint                     # lint
```

---

## Known limitations

- Authorized clients are held in memory, so restarting the backend ends every session.
- `repo` is broader than VisualMerge needs. GitHub OAuth Apps offer no read-only private scope.
- The repository list is capped at `visualmerge.github.max-repository-pages` pages of 100.
- The JGit workspace layer is not yet connected to merge sessions.
- CSRF protection is off for local development.
