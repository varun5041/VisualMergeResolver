#!/usr/bin/env bash
#
# Prints what is actually in the VisualMerge database.
#
# Reads the connection out of backend/.env, so no credential is typed on a
# command line or left in shell history. Nothing here writes.
#
#   ./backend/scripts/inspect-db.sh
#
set -euo pipefail

ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "No backend/.env found. Create it first (see README)." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

URL="${AIVEN_DB_URL:-}"
if [[ -z "$URL" ]]; then
  echo "AIVEN_DB_URL is not set in backend/.env." >&2
  exit 1
fi

DB_HOST=$(printf '%s' "$URL" | sed -E 's#jdbc:mysql://([^:/]+):?([0-9]*)/([^?]*).*#\1#')
DB_PORT=$(printf '%s' "$URL" | sed -E 's#jdbc:mysql://([^:/]+):?([0-9]*)/([^?]*).*#\2#')
DB_NAME=$(printf '%s' "$URL" | sed -E 's#jdbc:mysql://([^:/]+):?([0-9]*)/([^?]*).*#\3#')
DB_PORT="${DB_PORT:-3306}"

# The mysql client is not always on PATH on Windows.
MYSQL_BIN="${MYSQL_BIN:-mysql}"
if ! command -v "$MYSQL_BIN" >/dev/null 2>&1; then
  for candidate in \
    "/c/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" \
    "/c/Program Files/MySQL/MySQL Server 8.4/bin/mysql.exe"; do
    if [[ -x "$candidate" ]]; then MYSQL_BIN="$candidate"; break; fi
  done
fi
if ! command -v "$MYSQL_BIN" >/dev/null 2>&1 && [[ ! -x "$MYSQL_BIN" ]]; then
  echo "No mysql client found. Set MYSQL_BIN to its path." >&2
  exit 1
fi

# MYSQL_PWD keeps the password out of the process list.
MYSQL_PWD="$AIVEN_DB_PASSWORD" "$MYSQL_BIN" \
  -h "$DB_HOST" -P "$DB_PORT" -u "$AIVEN_DB_USER" \
  --ssl-mode=REQUIRED -D "$DB_NAME" --table <<'SQL'
SELECT '--- migrations ---' AS '';
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;

SELECT '--- users ---' AS '';
SELECT github_id, github_username, name, email, github_connected, created_at, updated_at
  FROM users ORDER BY created_at;

SELECT '--- repositories ---' AS '';
SELECT github_repository_id, full_name, private_repository, default_branch, created_at
  FROM repositories ORDER BY created_at;

SELECT '--- merge sessions ---' AS '';
SELECT s.id, u.github_username AS owner, r.full_name AS repository,
       s.base_branch, s.branch_a, s.branch_b, s.status, s.created_at
  FROM merge_sessions s
  JOIN users u ON u.id = s.user_id
  JOIN repositories r ON r.id = s.repository_id
 ORDER BY s.created_at;

SELECT '--- counts ---' AS '';
SELECT
  (SELECT COUNT(*) FROM users)             AS users,
  (SELECT COUNT(*) FROM repositories)      AS repositories,
  (SELECT COUNT(*) FROM user_repositories) AS user_repository_links,
  (SELECT COUNT(*) FROM merge_sessions)    AS merge_sessions;
SQL
