-- Adds the Cover Context field to saved_entries (see
-- docs/plans/cover-context-and-interview.md). This is an optional,
-- manually-editable per-cover textarea holding the real, factual story
-- behind one specific cover (why it was covered, memories, emotions,
-- recording/arrangement/mix decisions, anecdotes) — independent of
-- description blocks. Illegal Mind's description blocks carry fictional
-- SIGNAL/wasteland lore, which must never be treated as evidence of a real
-- recording event; this field is deliberately separate from that system and
-- is never shown in any generated output.
--
-- Plain text, not jsonb (unlike cover_short_hooks) — this is one free-form
-- paragraph field, not a list. No backfill: existing rows get the default
-- empty string, nothing is derived from any other field.
ALTER TABLE saved_entries
  ADD COLUMN IF NOT EXISTS cover_context text NOT NULL DEFAULT '';
