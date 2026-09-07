-- Stage 4 of the Saved Entry identity refactor (see docs/current-context.md's
-- "Saved Entry identity" note). FK-action hardening only — no data moves, no
-- identity/match_key/date/type change, no reference rewritten.
--
-- Fixes the long-standing delete bug: a saved entry referenced by a Calendar
-- slot could not be deleted because both upload_calendar_slots FKs are
-- ON DELETE NO ACTION (Postgres rejects the DELETE -> the route 500s -> the
-- client reloads -> the entry "comes back"). Rebuild both FKs with
-- ON DELETE SET NULL so deleting the entry succeeds and any slot referencing
-- it simply loses that reference (the slot row itself stays — NO cascade
-- delete of Calendar rows).
--
-- Re-runnable: the whole thing self-skips once both FKs are already
-- ON DELETE SET NULL. One transaction (server/migrate.js), so the post-check
-- rolls everything back on any surprise.

DO $$
DECLARE
  planned_del  "char";
  uploaded_del "char";
  cal_before   integer;
  cal_after    integer;
  p_before     integer;
  u_before     integer;
  p_after      integer;
  u_after      integer;
BEGIN
  SELECT confdeltype INTO planned_del  FROM pg_constraint
    WHERE conrelid = 'upload_calendar_slots'::regclass
      AND conname  = 'upload_calendar_slots_planned_entry_id_fkey';
  SELECT confdeltype INTO uploaded_del FROM pg_constraint
    WHERE conrelid = 'upload_calendar_slots'::regclass
      AND conname  = 'upload_calendar_slots_uploaded_entry_id_fkey';

  IF planned_del = 'n' AND uploaded_del = 'n' THEN
    RAISE NOTICE 'Calendar FKs already ON DELETE SET NULL - skipping.';
    RETURN;
  END IF;

  IF planned_del IS NULL OR uploaded_del IS NULL THEN
    RAISE EXCEPTION 'Expected upload_calendar_slots FKs by their Stage 3 names were not found (planned=%, uploaded=%). Aborting.',
      planned_del, uploaded_del;
  END IF;

  SELECT count(*), count(planned_entry_id), count(uploaded_entry_id)
    INTO cal_before, p_before, u_before
  FROM upload_calendar_slots;

  ALTER TABLE upload_calendar_slots
    DROP CONSTRAINT upload_calendar_slots_planned_entry_id_fkey,
    DROP CONSTRAINT upload_calendar_slots_uploaded_entry_id_fkey;

  ALTER TABLE upload_calendar_slots
    ADD CONSTRAINT upload_calendar_slots_planned_entry_id_fkey
      FOREIGN KEY (planned_entry_id) REFERENCES saved_entries (id) ON DELETE SET NULL,
    ADD CONSTRAINT upload_calendar_slots_uploaded_entry_id_fkey
      FOREIGN KEY (uploaded_entry_id) REFERENCES saved_entries (id) ON DELETE SET NULL;

  -- Post-check: the FK rebuild must not have touched a single row or reference.
  SELECT count(*), count(planned_entry_id), count(uploaded_entry_id)
    INTO cal_after, p_after, u_after
  FROM upload_calendar_slots;

  IF cal_after <> cal_before OR p_after <> p_before OR u_after <> u_before THEN
    RAISE EXCEPTION
      'Calendar FK rebuild changed data (rows %/%, planned %/%, uploaded %/%). Rolled back.',
      cal_after, cal_before, p_after, p_before, u_after, u_before;
  END IF;

  IF EXISTS (
    SELECT 1 FROM upload_calendar_slots s
    WHERE (s.planned_entry_id IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM saved_entries e WHERE e.id = s.planned_entry_id))
       OR (s.uploaded_entry_id IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM saved_entries e WHERE e.id = s.uploaded_entry_id))
  ) THEN
    RAISE EXCEPTION 'Calendar FK rebuild left an unresolved reference. Rolled back.';
  END IF;
END $$;
