-- Step 2 of the persistence migration (see
-- C:\Users\Max\.claude\plans\one-signal-many-terminals.md). Mirrors
-- illegalMindGeneratorData.tagOverrides[projectId][tagName] → override
-- object. label/category/visible/is_custom get real columns (worth
-- filtering/sorting on); everything else — title/thumbnail/hashtags/
-- description/shortHooks, all dynamic/config-driven arrays and nested
-- objects — lives in payload jsonb, per the approved "relational rows for
-- stable entities, JSONB only for genuinely dynamic nested content" design.
-- Nullable scalar columns matter here: NULL means "this field is not part
-- of the override" (falls back to the base projects.json tag), matching
-- localStorage's "key absent from the object" semantics exactly — not to be
-- confused with an explicit false/empty value. No dependency on any other
-- table.
CREATE TABLE IF NOT EXISTS tag_overrides (
  project_id text NOT NULL,
  tag_name text NOT NULL,
  label text,
  category text,
  visible boolean,
  is_custom boolean,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (project_id, tag_name)
);
