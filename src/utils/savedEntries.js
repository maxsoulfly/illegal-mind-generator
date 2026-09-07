// Client-only saved-entry helpers: the normalized Artist+Song MATCH KEY and
// the two formData<->entry field-list mappers. The non-destructive import
// merge and bulk dedup live server-side (server/savedEntryMerge.js,
// server/routes/savedEntries.js).
//
// Since the Stage 3 identity refactor, saved-entry identity is
// `entry.id` — an immutable UUID assigned once at creation. buildEntryMatchKey
// is ONLY for duplicate detection / import matching / legacy-queue-id
// resolution; it is never an id. (Kept byte-identical to the server copy in
// server/savedEntryMerge.js — mirror any change by hand.)

export const buildEntryMatchKey = (artist, song) =>
  `${artist}-${song}`.trim().toLowerCase().replace(/\s+/g, ' ');

export const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-');

// The explicit save-field list — see Known Gotchas in CLAUDE.md: adding a new
// formData field does NOT automatically persist it per-entry, it must be
// added here and to buildFormDataPatchFromEntry (load) and, on the server,
// mergeImportedEntry (import) together.
export function buildEntryFromFormData(formData) {
  return {
    // Immutable UUID identity carried through from a loaded/created entry.
    // null for a brand-new unsaved form — handleSaveEntry assigns the UUID.
    // NEVER derived from Artist+Song.
    id: formData.id ?? null,
    artist: formData.artist.trim(),
    song: formData.song.trim(),
    signalNumber: formData.signalNumber.trim(),
    originalYear: formData.originalYear?.trim() || '',
    originalGenre: formData.originalGenre?.trim() || '',
    useCustomArtistShort: formData.useCustomArtistShort || false,
    artistShort: formData.artistShort?.trim() || '',

    transformationTags: formData.transformationTags || [],
    customHashtags: formData.customHashtags?.trim() || '',
    customCta: formData.customCta,
    coverShortHooks: formData.coverShortHooks || [],
    coverContext: formData.coverContext?.trim() || '',
    songBlockOverrides: formData.songBlockOverrides || {},
    excludeFromRandomizer: formData.excludeFromRandomizer || false,
    todo: {
      status: formData.todo?.status || '',
      notes: formData.todo?.notes?.trim() || '',
    },
  };
}

// The explicit load-field list — see buildEntryFromFormData's comment above.
export function buildFormDataPatchFromEntry(entry, prevFormData) {
  const songBlockOverrides = { ...(entry.songBlockOverrides || {}) };

  // Legacy fields that predate songBlockOverrides — seed them forward once
  // so the generic override fields show old data and future saves migrate
  // naturally, without touching stored entries directly.
  if (!songBlockOverrides.customCtaBlock && entry.customCta?.trim()) {
    songBlockOverrides.customCtaBlock = entry.customCta.trim();
  }
  if (!songBlockOverrides.storyBlock && entry.customStory?.trim()) {
    songBlockOverrides.storyBlock = entry.customStory.trim();
  }
  if (!songBlockOverrides.logBlock && entry.customLogNote?.trim()) {
    songBlockOverrides.logBlock = entry.customLogNote.trim();
  }

  return {
    ...prevFormData,
    // Adopt the loaded entry's immutable UUID so subsequent edits + Save
    // target the same row (a rename updates, never duplicates).
    id: entry.id ?? null,
    artist: entry.artist || '',
    song: entry.song || '',
    signalNumber: entry.signalNumber || '',
    originalYear: entry.originalYear || '',
    originalGenre: entry.originalGenre || '',
    useCustomArtistShort: entry.useCustomArtistShort || false,
    artistShort: entry.artistShort || '',
    transformationTags: entry.transformationTags || [],
    customHashtags: entry.customHashtags?.trim() || '',
    customCta: entry.customCta || '',
    customLogNote: entry.customLogNote || '',
    coverShortHooks: entry.coverShortHooks || [],
    coverContext: entry.coverContext || '',
    songBlockOverrides,

    excludeFromRandomizer: entry.excludeFromRandomizer || false,
    todo: {
      status: entry.todo?.status || '',
      notes: entry.todo?.notes || '',
    },
    entryLoadToken: (prevFormData.entryLoadToken || 0) + 1,
  };
}
