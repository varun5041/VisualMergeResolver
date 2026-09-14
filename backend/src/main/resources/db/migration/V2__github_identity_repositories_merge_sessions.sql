-- Makes GitHub the stable external identity, adds the repository catalogue and
-- turns merge sessions into real rows that point at a persisted repository.
--
-- Nothing here deletes a user. The one pre-existing account keeps its row and
-- is adopted on its next GitHub login (see UserService#upsertFromGitHub).

-- ---------------------------------------------------------------------------
-- users: GitHub identity
-- ---------------------------------------------------------------------------

-- github_id is the stable identity. It is nullable only so the accounts that
-- existed before this migration survive; they are filled in on next login.
ALTER TABLE users
    ADD COLUMN github_id       VARCHAR(64)  NULL AFTER id,
    ADD COLUMN github_username VARCHAR(255) NULL AFTER github_id,
    ADD COLUMN avatar_url      VARCHAR(512) NULL AFTER email;

ALTER TABLE users
    ADD UNIQUE KEY uk_users_github_id (github_id);

-- GitHub accounts can hide their email and can have no display name, so
-- neither can stay NOT NULL.
ALTER TABLE users
    MODIFY COLUMN name  VARCHAR(255) NULL,
    MODIFY COLUMN email VARCHAR(255) NULL;

ALTER TABLE users
    MODIFY COLUMN github_connected BIT(1) NOT NULL DEFAULT b'0';

-- ---------------------------------------------------------------------------
-- repositories: GitHub repositories that became relevant to VisualMerge
-- ---------------------------------------------------------------------------

-- Rows are written when a repository is actually used (a merge session is
-- created against it), never by listing the dashboard. GitHub stays the source
-- of truth for names, visibility and access; this table only gives merge
-- sessions something stable to point at.
CREATE TABLE IF NOT EXISTS repositories (
    id                   BINARY(16)   NOT NULL,
    github_repository_id BIGINT       NOT NULL,
    owner                VARCHAR(255) NOT NULL,
    name                 VARCHAR(255) NOT NULL,
    full_name            VARCHAR(511) NOT NULL,
    private_repository   BIT(1)       NOT NULL DEFAULT b'0',
    default_branch       VARCHAR(255) NULL,
    html_url             VARCHAR(512) NULL,
    created_at           DATETIME(6)  NOT NULL,
    updated_at           DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_repositories_github_id (github_repository_id),
    KEY idx_repositories_full_name (full_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------------------------------------------------------------------------
-- user_repositories: which users have worked with which repositories
-- ---------------------------------------------------------------------------

-- A repository can be used by many VisualMerge users and a user can use many
-- repositories, so the link is many-to-many. This is usage history for the
-- product surface only -- it is NOT an authorization record. Every request is
-- still checked against GitHub, which remains the authority on access.
CREATE TABLE IF NOT EXISTS user_repositories (
    user_id       BINARY(16)  NOT NULL,
    repository_id BINARY(16)  NOT NULL,
    linked_at     DATETIME(6) NOT NULL,
    PRIMARY KEY (user_id, repository_id),
    KEY idx_user_repositories_repository (repository_id),
    CONSTRAINT fk_user_repositories_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_repositories_repository
        FOREIGN KEY (repository_id) REFERENCES repositories (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------------------------------------------------------------------------
-- merge_sessions: point at a real repository row, use the status enum
-- ---------------------------------------------------------------------------

-- The old repository_id held a free-text "owner/name" string. The table has no
-- rows yet, so replacing the column loses nothing.
ALTER TABLE merge_sessions
    DROP COLUMN repository_id;

ALTER TABLE merge_sessions
    ADD COLUMN repository_id BINARY(16) NOT NULL AFTER user_id;

ALTER TABLE merge_sessions
    MODIFY COLUMN status VARCHAR(32) NOT NULL;

ALTER TABLE merge_sessions
    ADD KEY idx_merge_sessions_repository (repository_id),
    ADD KEY idx_merge_sessions_owner_recent (user_id, updated_at),
    ADD CONSTRAINT fk_merge_sessions_repository
        FOREIGN KEY (repository_id) REFERENCES repositories (id);
