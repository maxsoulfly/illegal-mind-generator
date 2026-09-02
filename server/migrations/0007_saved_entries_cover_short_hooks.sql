-- Adds cover-specific Short Hooks to saved_entries (see
-- C:\Users\Max\.claude\plans\quiet-static-between-two-true-tags.md, the
-- "Two small additions replacing V2" section). This is NOT the shelved
-- Generation V2 composition engine — it's a flat, uncategorized list of
-- hooks containing information unique to one specific cover (personal
-- story, why it was covered, an unusual recording/arrangement/song-part
-- detail, an anecdote). During generation they join the normal Short Hook
-- candidate pool for the loaded cover alongside base + selected-tag hooks.
--
-- Shape mirrors transformation_tags: a plain jsonb string array, not the
-- dynamic-keyed object song_block_overrides uses.
ALTER TABLE saved_entries
  ADD COLUMN IF NOT EXISTS cover_short_hooks jsonb NOT NULL DEFAULT '[]'::jsonb;
