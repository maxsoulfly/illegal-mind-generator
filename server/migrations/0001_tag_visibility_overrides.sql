-- Step 1 of the persistence migration (see
-- C:\Users\Max\.claude\plans\one-signal-many-terminals.md).
-- Mirrors illegalMindGeneratorData.tagVisibilityOverrides[projectId][tagName]
-- → boolean. No dependency on any other table.
CREATE TABLE IF NOT EXISTS tag_visibility_overrides (
  project_id text NOT NULL,
  tag_name text NOT NULL,
  visible boolean NOT NULL,
  PRIMARY KEY (project_id, tag_name)
);
