-- Baseline of the schema Hibernate's ddl-auto=update had already created in
-- Aiven before migrations existed.
--
-- On the existing database every statement here is a no-op: the tables are
-- already present. On a fresh database it reproduces exactly that starting
-- shape, so V2 has the same starting point everywhere.

CREATE TABLE IF NOT EXISTS users (
    id               BINARY(16)   NOT NULL,
    name             VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    password_hash    VARCHAR(255) NULL,
    github_connected BIT(1)       NOT NULL,
    created_at       DATETIME(6)  NOT NULL,
    updated_at       DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS merge_sessions (
    id              BINARY(16)   NOT NULL,
    user_id         BINARY(16)   NOT NULL,
    repository_id   VARCHAR(255) NOT NULL,
    base_branch     VARCHAR(255) NOT NULL,
    branch_a        VARCHAR(255) NOT NULL,
    branch_b        VARCHAR(255) NOT NULL,
    status          VARCHAR(255) NOT NULL,
    conflicts_count INT          NULL,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_merge_sessions_user (user_id),
    CONSTRAINT fk_merge_sessions_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
