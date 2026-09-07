-- Stage 2 of the Saved Entry identity refactor (see docs/current-context.md's
-- "Saved Entry identity" note). DATA BACKFILL + GUARD ONLY — no schema change,
-- no runtime cutover. Populates the Stage 1 shadow columns
-- upload_calendar_slots.{planned,uploaded}_entry_uuid from the still-current
-- text references, joining on the pre-cutover identity:
--   (project_id, old text saved_entries.id)  ->  saved_entries.uuid
--
-- The old text columns planned_entry_id / uploaded_entry_id and their two
-- existing composite foreign keys are left completely untouched; the running
-- app keeps resolving Calendar entries by the text id exactly as before. No
-- FK is added to the shadow columns here (that is Stage 3).
--
-- Re-runnable: the whole file runs in one transaction (see server/migrate.js).
-- The join is deterministic, so re-running rewrites each shadow UUID with the
-- same value. The orphan guard below re-verifies the invariant every run and
-- ABORTS the transaction (rolling back both UPDATEs) if any non-null text
-- reference fails to resolve to exactly one saved_entries row — it never
-- leaves a shadow column NULL-where-text-is-set or guesses a value.

-- --- Guard: every non-null text reference must resolve to exactly one row ---
DO $$
DECLARE
  planned_orphans   integer;
  uploaded_orphans  integer;
BEGIN
  SELECT count(*) INTO planned_orphans
  FROM upload_calendar_slots s
  LEFT JOIN saved_entries e
    ON e.project_id = s.project_id AND e.id = s.planned_entry_id
  WHERE s.planned_entry_id IS NOT NULL AND e.id IS NULL;

  SELECT count(*) INTO uploaded_orphans
  FROM upload_calendar_slots s
  LEFT JOIN saved_entries e
    ON e.project_id = s.project_id AND e.id = s.uploaded_entry_id
  WHERE s.uploaded_entry_id IS NOT NULL AND e.id IS NULL;

  IF planned_orphans > 0 OR uploaded_orphans > 0 THEN
    RAISE EXCEPTION
      'Calendar UUID backfill aborted: % orphan planned_entry_id and % orphan uploaded_entry_id reference(s) do not resolve to a saved_entries row. Resolve the orphans before re-running; nothing was changed.',
      planned_orphans, uploaded_orphans;
  END IF;
END $$;

-- --- Backfill ---
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

-- --- Post-condition: shadow UUID population must exactly mirror the text refs ---
DO $$
DECLARE
  planned_id_cnt    integer;
  planned_uuid_cnt  integer;
  uploaded_id_cnt   integer;
  uploaded_uuid_cnt integer;
  mismatch_cnt      integer;
BEGIN
  SELECT count(planned_entry_id), count(planned_entry_uuid),
         count(uploaded_entry_id), count(uploaded_entry_uuid)
    INTO planned_id_cnt, planned_uuid_cnt, uploaded_id_cnt, uploaded_uuid_cnt
  FROM upload_calendar_slots;

  IF planned_uuid_cnt <> planned_id_cnt OR uploaded_uuid_cnt <> uploaded_id_cnt THEN
    RAISE EXCEPTION
      'Calendar UUID backfill post-check failed: planned %/% , uploaded %/% (uuid/text). Rolled back.',
      planned_uuid_cnt, planned_id_cnt, uploaded_uuid_cnt, uploaded_id_cnt;
  END IF;

  -- Every populated shadow UUID must point at the SAME saved entry the text id does.
  SELECT count(*) INTO mismatch_cnt
  FROM upload_calendar_slots s
  JOIN saved_entries e ON e.project_id = s.project_id AND e.id = s.planned_entry_id
  WHERE s.planned_entry_id IS NOT NULL AND s.planned_entry_uuid IS DISTINCT FROM e.uuid;
  IF mismatch_cnt > 0 THEN
    RAISE EXCEPTION 'Calendar UUID backfill: % planned shadow UUID(s) disagree with the text id. Rolled back.', mismatch_cnt;
  END IF;

  SELECT count(*) INTO mismatch_cnt
  FROM upload_calendar_slots s
  JOIN saved_entries e ON e.project_id = s.project_id AND e.id = s.uploaded_entry_id
  WHERE s.uploaded_entry_id IS NOT NULL AND s.uploaded_entry_uuid IS DISTINCT FROM e.uuid;
  IF mismatch_cnt > 0 THEN
    RAISE EXCEPTION 'Calendar UUID backfill: % uploaded shadow UUID(s) disagree with the text id. Rolled back.', mismatch_cnt;
  END IF;
END $$;
