// Intentional temporary duplicate of the pure functions in
// src/utils/savedEntries.js (buildEntryId/isEmptyValue/preferNonEmpty/
// mergeImportedEntry). Phase A steps make zero changes to src/ on purpose
// (see the persistence plan's migration execution constraint) — this is
// copied rather than imported so this step doesn't touch app code at all.
// Consolidate into one shared module when Step 10 touches
// useSavedEntries.js/savedEntries.js for the real hook swap; until then,
// any change to this logic on one side must be mirrored to the other by
// hand. mergeImportedEntry in particular is documented in CLAUDE.md's Known
// Gotchas as the fix for a real data-loss bug — do not "simplify" it.

export const buildEntryId = (artist, song) =>
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
    id: buildEntryId(item.artist, item.song),
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
