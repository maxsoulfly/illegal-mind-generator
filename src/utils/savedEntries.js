// Persistence migration Step 9: the non-destructive import merge
// (mergeImportedEntry + preferNonEmpty/isEmptyValue), the bulk-add id
// normalization (normalizeEntryIds) and the localStorage lazy initializer
// (loadInitialSavedEntriesByProject) all moved server-side / became obsolete
// when useSavedEntries.js switched to the API — see server/savedEntryMerge.js
// and server/routes/savedEntries.js. What remains here is the client-only
// pieces: the id derivation and the two formData<->entry field-list mappers.

export const buildEntryId = (artist, song) =>
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
    id: buildEntryId(formData.artist, formData.song),
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
    songBlockOverrides,

    excludeFromRandomizer: entry.excludeFromRandomizer || false,
    todo: {
      status: entry.todo?.status || '',
      notes: entry.todo?.notes || '',
    },
    entryLoadToken: (prevFormData.entryLoadToken || 0) + 1,
  };
}
