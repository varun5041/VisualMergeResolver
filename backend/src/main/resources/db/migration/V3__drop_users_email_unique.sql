-- Email is no longer an identity, so it must no longer be unique.
--
-- github_id identifies an account now. Leaving a unique key on email means a
-- second GitHub account that reports the same address cannot sign in at all:
-- the insert fails on a constraint that no longer protects anything.
--
-- The index was created by Hibernate on the existing database with a generated
-- name (UK6dot...) and by V1 with an explicit name, so the name is looked up
-- rather than assumed, and the drop is skipped when there is nothing to drop.

SET @index_name := (
    SELECT INDEX_NAME
      FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'email'
       AND NON_UNIQUE = 0
     LIMIT 1
);

SET @statement := IF(
    @index_name IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE users DROP INDEX `', @index_name, '`')
);

PREPARE drop_email_unique FROM @statement;
EXECUTE drop_email_unique;
DEALLOCATE PREPARE drop_email_unique;

-- Lookups by email still happen once per legacy account adoption, so the
-- column keeps a plain index.
CREATE INDEX idx_users_email ON users (email);
