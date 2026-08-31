-- Step 6 of the persistence migration (see
-- C:\Users\Max\.claude\plans\one-signal-many-terminals.md) — the last
-- domain table; closes out Phase A. Mirrors
-- illegalMindGeneratorData.uploadCalendar[projectId][slotKey] ->
-- {plannedEntryId, uploadedEntryId}. slotKey (`${isoDate}|${videoType}`) is
-- scoped per project, so the real primary key is the 3-column combo, not a
-- separate synthetic id.
--
-- Both entry-id columns are nullable (a slot can have a plan, an upload,
-- both, or neither) and use the same composite-FK pattern as Step 5's
-- shorts_queue_items — (project_id, x) -> saved_entries(project_id, id), not
-- a plain single-column FK, for the same reason (buildEntryId alone is not
-- unique across projects). Postgres's default FK match semantics (MATCH
-- SIMPLE) skip the constraint entirely when any FK column is NULL, so a
-- slot with no plan/upload needs no special-casing here.
--
-- Status (planned/missed/uploaded/uploaded-drift) is intentionally NOT a
-- column — deriveSlotStatus stays a pure, client-side function of these two
-- fields plus "today," exactly as it is now.
CREATE TABLE IF NOT EXISTS upload_calendar_slots (
  project_id text NOT NULL,
  iso_date date NOT NULL,
  video_type text NOT NULL,
  planned_entry_id text,
  uploaded_entry_id text,
  PRIMARY KEY (project_id, iso_date, video_type),
  FOREIGN KEY (project_id, planned_entry_id) REFERENCES saved_entries (project_id, id),
  FOREIGN KEY (project_id, uploaded_entry_id) REFERENCES saved_entries (project_id, id)
);
