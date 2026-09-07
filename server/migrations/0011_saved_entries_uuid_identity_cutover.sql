-- Stage 3 (schema half) of the Saved Entry identity refactor (see
-- docs/current-context.md's "Saved Entry identity" note). Promotes the
-- Stage 1 saved_entries.uuid to the real primary key, demotes the old
-- derived text id (normalized Artist+Song) to a non-identity `match_key`,
-- and repoints the two upload_calendar_slots foreign keys at the UUID
-- identity using the Stage 2 shadow columns. Runs in one transaction
-- (server/migrate.js), so any RAISE EXCEPTION below rolls the whole thing
-- back — it never partially cuts over, nulls a reference, or guesses.
--
-- shorts_queue_items: the table, its data (none — it is empty and unused;
-- the live Shorts Queue is localStorage) and migration 0005 are all left
-- alone. Its ONE composite foreign key into saved_entries(project_id, id)
-- structurally blocks renaming saved_entries.id, so that single constraint
-- is dropped here. The empty, now-FK-less table stays as dead infra; its
-- full teardown remains a separate later task with its own migration.
--
-- Also NOT touched: any localStorage / client-side data.
--
-- Re-runnable: the refreshed backfill + hard gate at the top are idempotent;
-- the structural section self-skips once saved_entries.uuid no longer exists.

-- 1. Refresh the calendar shadow backfill. The live app has been writing new
--    text references since migration 0010 (verified: 1 such row at cutover
--    time), and the server route does not populate the shadow columns.
--    Deterministic join on (project_id, old text id) -> saved_entries.uuid.
UPDATE upload_calendar_slots AS s
SET planned_entry_uuid = e.uuid
FROM saved_entries AS e
WHERE s.project_id = e.project_id
  AND s.planned_entry_id = e.id
  AND s.planned_entry_id IS NOT NULL;

UPDATE upload_calendar_slots AS s
SET uploaded_entry_uuid = e.uuid
FROM saved_entries AS e
WHERE s.project_id = e.project_id
  AND s.uploaded_entry_id = e.id
  AND s.uploaded_entry_id IS NOT NULL;

-- 2. Hard gate: every non-null text reference must now have a resolved shadow
--    UUID that matches, and none may point at a different saved entry.
DO $$
DECLARE
  planned_gap   integer;
  uploaded_gap  integer;
  planned_bad   integer;
  uploaded_bad  integer;
BEGIN
  SELECT count(*) INTO planned_gap
    FROM upload_calendar_slots
    WHERE planned_entry_id IS NOT NULL AND planned_entry_uuid IS NULL;
  SELECT count(*) INTO uploaded_gap
    FROM upload_calendar_slots
    WHERE uploaded_entry_id IS NOT NULL AND uploaded_entry_uuid IS NULL;
  SELECT count(*) INTO planned_bad
    FROM upload_calendar_slots s
    JOIN saved_entries e ON e.project_id = s.project_id AND e.id = s.planned_entry_id
    WHERE s.planned_entry_id IS NOT NULL AND s.planned_entry_uuid IS DISTINCT FROM e.uuid;
  SELECT count(*) INTO uploaded_bad
    FROM upload_calendar_slots s
    JOIN saved_entries e ON e.project_id = s.project_id AND e.id = s.uploaded_entry_id
    WHERE s.uploaded_entry_id IS NOT NULL AND s.uploaded_entry_uuid IS DISTINCT FROM e.uuid;

  IF planned_gap > 0 OR uploaded_gap > 0 OR planned_bad > 0 OR uploaded_bad > 0 THEN
    RAISE EXCEPTION
      'Identity cutover aborted: calendar shadow refs inconsistent (planned gap %, uploaded gap %, planned mismatch %, uploaded mismatch %). Nothing changed.',
      planned_gap, uploaded_gap, planned_bad, uploaded_bad;
  END IF;
END $$;

-- 3. Structural cutover. Self-skips if saved_entries.uuid is already gone.
DO $$
DECLARE
  se_before  integer;
  cal_before integer;
  se_after   integer;
  cal_after  integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'saved_entries' AND column_name = 'uuid'
  ) THEN
    RAISE NOTICE 'saved_entries.uuid already gone - cutover previously applied, skipping structural section.';
    RETURN;
  END IF;

  SELECT count(*) INTO se_before  FROM saved_entries;
  SELECT count(*) INTO cal_before FROM upload_calendar_slots;

  -- 3a. Drop every FK that targets the old saved_entries(project_id, id) PK:
  --     the two composite calendar FKs (rebuilt against the UUID id in 3c),
  --     and the dead shorts_queue_items FK (not rebuilt — see header note).
  ALTER TABLE upload_calendar_slots
    DROP CONSTRAINT IF EXISTS upload_calendar_slots_project_id_planned_entry_id_fkey,
    DROP CONSTRAINT IF EXISTS upload_calendar_slots_project_id_uploaded_entry_id_fkey;
  ALTER TABLE shorts_queue_items
    DROP CONSTRAINT IF EXISTS shorts_queue_items_project_id_saved_entry_id_fkey;

  -- 3b. saved_entries: text id -> match_key (kept, non-unique, indexed);
  --     uuid -> id (new primary key).
  ALTER TABLE saved_entries DROP CONSTRAINT saved_entries_pkey;
  DROP INDEX saved_entries_uuid_key;
  ALTER TABLE saved_entries RENAME COLUMN id TO match_key;
  ALTER TABLE saved_entries RENAME COLUMN uuid TO id;
  ALTER TABLE saved_entries ADD CONSTRAINT saved_entries_pkey PRIMARY KEY (id);
  CREATE INDEX saved_entries_project_match_key_idx
    ON saved_entries (project_id, match_key);

  -- 3c. upload_calendar_slots: swap the text ref columns for the UUID shadow
  --     columns, then add single-column FKs to the new saved_entries(id).
  ALTER TABLE upload_calendar_slots DROP COLUMN planned_entry_id;
  ALTER TABLE upload_calendar_slots DROP COLUMN uploaded_entry_id;
  ALTER TABLE upload_calendar_slots RENAME COLUMN planned_entry_uuid TO planned_entry_id;
  ALTER TABLE upload_calendar_slots RENAME COLUMN uploaded_entry_uuid TO uploaded_entry_id;
  ALTER TABLE upload_calendar_slots
    ADD CONSTRAINT upload_calendar_slots_planned_entry_id_fkey
      FOREIGN KEY (planned_entry_id) REFERENCES saved_entries (id),
    ADD CONSTRAINT upload_calendar_slots_uploaded_entry_id_fkey
      FOREIGN KEY (uploaded_entry_id) REFERENCES saved_entries (id);

  -- 3d. Post-conditions: no row lost, no calendar reference orphaned.
  SELECT count(*) INTO se_after  FROM saved_entries;
  SELECT count(*) INTO cal_after FROM upload_calendar_slots;

  IF se_after <> se_before OR cal_after <> cal_before THEN
    RAISE EXCEPTION
      'Identity cutover row-count change (saved_entries %/%, calendar %/%). Rolled back.',
      se_after, se_before, cal_after, cal_before;
  END IF;

  IF EXISTS (
    SELECT 1 FROM upload_calendar_slots s
    WHERE (s.planned_entry_id IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM saved_entries e WHERE e.id = s.planned_entry_id))
       OR (s.uploaded_entry_id IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM saved_entries e WHERE e.id = s.uploaded_entry_id))
  ) THEN
    RAISE EXCEPTION 'Identity cutover left an unresolved calendar reference. Rolled back.';
  END IF;
END $$;
