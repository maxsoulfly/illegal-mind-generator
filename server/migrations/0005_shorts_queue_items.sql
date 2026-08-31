-- Step 5 of the persistence migration (see
-- C:\Users\Max\.claude\plans\one-signal-many-terminals.md). Mirrors
-- illegalMindGeneratorData.shortsQueues[projectId].queue -> entryId[]. Real
-- rows with a real position column and a real foreign key — the queue can
-- never reference a saved entry that doesn't exist, a property today's code
-- only maintains by convention.
--
-- The foreign key is composite, (project_id, saved_entry_id), matching
-- Step 4's composite primary key on saved_entries (project_id, id) — a
-- plain saved_entry_id-only FK would be wrong, since buildEntryId(artist,
-- song) is not unique across projects on its own.
CREATE TABLE IF NOT EXISTS shorts_queue_items (
  project_id text NOT NULL,
  position int NOT NULL,
  saved_entry_id text NOT NULL,
  PRIMARY KEY (project_id, position),
  FOREIGN KEY (project_id, saved_entry_id) REFERENCES saved_entries (project_id, id)
);
