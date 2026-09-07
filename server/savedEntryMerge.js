// Intentional duplicate of the pure helpers in src/utils/savedEntries.js
// (buildEntryMatchKey/isEmptyValue/preferNonEmpty/mergeImportedEntry). Kept
// as a copy rather than a shared import so the server has no dependency on
// src/ — any change to this logic on one side MUST be mirrored to the other
// by hand. mergeImportedEntry in particular is documented in CLAUDE.md's
// Known Gotchas as the fix for a real data-loss bug — do not "simplify" it.
//
// buildEntryMatchKey is the normalized Artist+Song string. Since the
// Stage 3 identity refactor it is ONLY a duplicate/import match key — never
// a saved-entry id. Identity is saved_entries.id (an immutable UUID).

export const buildEntryMatchKey = (artist, song) =>
  `${artist}-${song}`.trim().toLowerCase().replace(/\s+/g, ' ');

const isEmptyValue = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === 'object') return Object.keys(value).length === 0;
  return !value;
};

const preferNonEmpty = (importedValue, existingValue) =>
  isEmptyValue(importedValue) ? (existingValue ?? importedValue) : importedValue;

export const mergeImportedEntry = (item, existing) => {
  const importedOverrides = (() => {
    const overrides =
      item.songBlockOverrides && typeof item.songBlockOverrides === 'object'
        ? { ...item.songBlockOverrides }
        : {};
    if (!overrides.storyBlock && String(item.customStory || '').trim()) {
      overrides.storyBlock = String(item.customStory).trim();
    }
    if (!overrides.logBlock && String(item.customLogNote || '').trim()) {
      overrides.logBlock = String(item.customLogNote).trim();
    }
    return overrides;
  })();

  return {
    // Identity comes from the matched existing row (a UUID) or, for a brand-
    // new entry, is left undefined so the caller / DB default assigns a UUID.
    // NEVER derived from Artist+Song any more.
    id: existing?.id,
    artist: item.artist.trim(),
    song: item.song.trim(),
    signalNumber: preferNonEmpty(
      String(item.signalNumber || '').trim(),
      existing?.signalNumber,
    ),
    originalYear: preferNonEmpty(
      String(item.originalYear || '').trim(),
      existing?.originalYear,
    ),
    originalGenre: preferNonEmpty(
      String(item.originalGenre || '').trim(),
      existing?.originalGenre,
    ),
    useCustomArtistShort:
      item.useCustomArtistShort !== undefined
        ? Boolean(item.useCustomArtistShort)
        : existing?.useCustomArtistShort || false,
    artistShort: preferNonEmpty(
      String(item.artistShort || '').trim(),
      existing?.artistShort,
    ),
    transformationTags: preferNonEmpty(
      Array.isArray(item.transformationTags) ? item.transformationTags : [],
      existing?.transformationTags,
    ),
    customHashtags: preferNonEmpty(
      String(item.customHashtags || '').trim(),
      existing?.customHashtags,
    ),
    customCta: preferNonEmpty(String(item.customCta || '').trim(), existing?.customCta),
    coverShortHooks: preferNonEmpty(
      Array.isArray(item.coverShortHooks) ? item.coverShortHooks : [],
      existing?.coverShortHooks,
    ),
    coverContext: preferNonEmpty(
      String(item.coverContext || '').trim(),
      existing?.coverContext,
    ),
    songBlockOverrides: {
      ...(existing?.songBlockOverrides || {}),
      ...importedOverrides,
    },
    excludeFromRandomizer:
      item.excludeFromRandomizer !== undefined
        ? Boolean(item.excludeFromRandomizer)
        : existing?.excludeFromRandomizer || false,
    todo: {
      status: preferNonEmpty(String(item.todo?.status || '').trim(), existing?.todo?.status),
      notes: preferNonEmpty(String(item.todo?.notes || '').trim(), existing?.todo?.notes),
    },
  };
};
