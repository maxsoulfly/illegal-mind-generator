-- Stage 1 of the Saved Entry identity refactor (audit approved; see
-- docs/current-context.md's "Saved Entry identity" note). ADDITIVE ONLY —
-- introduces the future immutable UUID identity without cutting anything
-- over. No primary key change, no rename, no FK change, no application code
-- change. The running app keeps using the derived text `id`
-- (buildEntryId(artist, song)) exactly as before.
--
-- saved_entries.uuid: every existing row gets a fresh UUID immediately via
-- the volatile column default; every future INSERT gets one too. Uniqueness
-- is guaranteed now so Stage 3 can promote this column to the primary key
-- without a surprise. A UNIQUE INDEX (not an ADD CONSTRAINT) is used because
-- it supports IF NOT EXISTS, matching this folder's re-runnable convention.
--
-- upload_calendar_slots.{planned,uploaded}_entry_uuid: nullable, unconstrained
-- shadow columns, populated by the Stage 2 backfill (resolve each existing
-- text reference -> saved_entries.uuid via the still-present text `id`). No
-- foreign key on them until Stage 3 rebuilds the calendar FKs against the
-- UUID identity.
--
-- match_key (normalized Artist+Song for duplicate/import matching) is
-- deliberately NOT added here — it only becomes useful once write paths
-- populate it and the duplicate-match logic reads it, both of which are
-- Stage 3 runtime work. Adding it now would be an unused column.

ALTER TABLE saved_entries
  ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS saved_entries_uuid_key
  ON saved_entries (uuid);

ALTER TABLE upload_calendar_slots
  ADD COLUMN IF NOT EXISTS planned_entry_uuid uuid,
  ADD COLUMN IF NOT EXISTS uploaded_entry_uuid uuid;
