-- Step 3 of the persistence migration (see
-- C:\Users\Max\.claude\plans\one-signal-many-terminals.md). Mirrors
-- illegalMindGeneratorData.projectOverrides[projectId] → settings object.
-- One row per project, one jsonb column — this domain's content (title
-- templates, shortHookTypes, thumbnail config, description.templates
-- including dynamic customBlocks/phraseBlockScopes, blockGroups,
-- customHookBlocks, customPlaceholders, todoStatuses, uploadSchedule, etc.)
-- mirrors projects.json's own dynamically-shaped, user-extensible config —
-- decomposing it into fixed relational tables would mean re-deriving
-- projects.json's schema as SQL, fighting this app's config-driven
-- architecture. No dependency on any other table.
CREATE TABLE IF NOT EXISTS project_overrides (
  project_id text PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb
);
