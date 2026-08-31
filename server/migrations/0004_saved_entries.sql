-- Step 4 of the persistence migration (see
-- C:\Users\Max\.claude\plans\one-signal-many-terminals.md). Mirrors
-- illegalMindGeneratorData.savedEntries[projectId] -> Entry[]. Real scalar
-- columns for every field CLAUDE.md's Known Gotchas documents as the
-- explicit save/load field list (artist, song, signalNumber, originalYear,
-- originalGenre, useCustomArtistShort, artistShort, customHashtags,
-- customCta, excludeFromRandomizer, todo.status/todo.notes) — all genuinely
-- worth their own columns for filtering/sorting (e.g. Todo status). Only
-- transformation_tags (a plain string array) and song_block_overrides
-- (dynamic, config-driven block keys) are jsonb.
--
-- Primary key is (project_id, id), NOT id alone: buildEntryId(artist, song)
-- does not include project_id, so the same artist+song pair can legitimately
-- exist as two separate entries in two different projects (e.g. the same
-- song covered for both Illegal Mind Covers and Maxx Dee Covers) — a real
-- scenario, not hypothetical, given this app's two-project design.
CREATE TABLE IF NOT EXISTS saved_entries (
  id text NOT NULL,
  project_id text NOT NULL,
  artist text NOT NULL,
  song text NOT NULL,
  signal_number text NOT NULL DEFAULT '',
  original_year text NOT NULL DEFAULT '',
  original_genre text NOT NULL DEFAULT '',
  use_custom_artist_short boolean NOT NULL DEFAULT false,
  artist_short text NOT NULL DEFAULT '',
  exclude_from_randomizer boolean NOT NULL DEFAULT false,
  custom_hashtags text NOT NULL DEFAULT '',
  custom_cta text NOT NULL DEFAULT '',
  todo_status text NOT NULL DEFAULT '',
  todo_notes text NOT NULL DEFAULT '',
  transformation_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  song_block_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (project_id, id)
);
