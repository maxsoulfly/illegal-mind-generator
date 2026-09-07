// Pure smoke tests for the client saved-entry helpers:
//  1. transformationTags order is a preserved priority (first = most
//     important) — it must survive save -> load and a JSON library import
//     without being re-sorted.
//  2. Identity (2026-09-08 UUID refactor): `id` is an immutable UUID carried
//     through save/load/import — NEVER derived from Artist+Song. A rename
//     (Artist or Song change) keeps the same `id`. `matchKey` is the
//     normalized Artist+Song, recomputed from the current values, used only
//     for duplicate/import matching — and the client and server copies of
//     buildEntryMatchKey must stay byte-identical.
//
// API-level contracts (bulk/import UUID reuse, Calendar UUID refs, delete
// SET-NULL, legacy match_key fetch) live in
// server/savedEntryIdentity.smoke.js (needs the dev server + Neon).
//
// Run: npx rolldown src/utils/savedEntries.test.js -f esm -p node \
//        -o /tmp/se.test.mjs && node /tmp/se.test.mjs

import {
  buildEntryFromFormData,
  buildFormDataPatchFromEntry,
  buildEntryMatchKey,
} from './savedEntries';
import {
  mergeImportedEntry,
  buildEntryMatchKey as serverBuildEntryMatchKey,
} from '../../server/savedEntryMerge.js';

let failures = 0;
const eq = (a, b, msg) => {
  const pass = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!pass) {
    failures++;
    console.error(`  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`);
  }
};

const REORDERED = ['darker', 'heavier', 'faithful']; // deliberately not alphabetical / not usage order

const baseFormData = {
  artist: 'Test Artist',
  song: 'Test Song',
  signalNumber: '07',
  originalYear: '',
  originalGenre: '',
  useCustomArtistShort: false,
  artistShort: '',
  transformationTags: REORDERED,
  customHashtags: '',
  customCta: '',
  coverShortHooks: [],
  songBlockOverrides: {},
  excludeFromRandomizer: false,
  todo: {},
};

// save -> entry
const entry = buildEntryFromFormData(baseFormData);
eq(entry.transformationTags, REORDERED, 'save: buildEntryFromFormData keeps the exact array order');

// entry -> load
const loaded = buildFormDataPatchFromEntry(entry, { transformationTags: [] });
eq(loaded.transformationTags, REORDERED, 'load: buildFormDataPatchFromEntry keeps the exact array order');

// full round-trip identity
eq(
  buildEntryFromFormData(buildFormDataPatchFromEntry(entry, {})).transformationTags,
  REORDERED,
  'round-trip: save(load(save(...))) is order-stable',
);

// JSON library import (server merge) — imported order wins, not merged/sorted
const merged = mergeImportedEntry(
  { ...entry, transformationTags: REORDERED },
  { ...entry, transformationTags: ['faithful', 'heavier', 'darker'] }, // existing has a different order
);
eq(
  merged.transformationTags,
  REORDERED,
  'import: mergeImportedEntry takes the imported array whole (no Set-union, no sort)',
);

// import falls back to existing order only when the imported list is empty
const mergedEmpty = mergeImportedEntry(
  { ...entry, transformationTags: [] },
  { ...entry, transformationTags: REORDERED },
);
eq(
  mergedEmpty.transformationTags,
  REORDERED,
  'import: empty imported list falls back to the existing entry order',
);

// --- identity (Stage 3): id is an immutable UUID carried through, never
// derived from Artist+Song ---
eq(
  buildEntryFromFormData(baseFormData).id,
  null,
  'save: a brand-new form (no formData.id) yields id: null (UUID assigned later)',
);
eq(
  buildEntryFromFormData({ ...baseFormData, id: 'UUID-123' }).id,
  'UUID-123',
  'save: an existing formData.id is carried through unchanged',
);
eq(
  buildFormDataPatchFromEntry({ ...entry, id: 'UUID-abc' }, {}).id,
  'UUID-abc',
  'load: the entry UUID is adopted into formData.id',
);
eq(
  mergeImportedEntry({ artist: 'A', song: 'B' }, { id: 'UUID-existing', artist: 'A', song: 'B' }).id,
  'UUID-existing',
  'import: a matched existing row keeps its UUID',
);
eq(
  mergeImportedEntry({ artist: 'A', song: 'B' }, undefined).id,
  undefined,
  'import: an unmatched item has no id (server/DB assigns the UUID)',
);

// --- identity (Stage 5 lock-in): rename keeps the UUID, match_key follows ---
const LOADED = { id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', artist: 'Old Artist', song: 'Old Song' };
const loadedForm = buildFormDataPatchFromEntry(LOADED, { ...baseFormData });

eq(
  buildEntryFromFormData({ ...loadedForm, artist: 'New Artist' }).id,
  LOADED.id,
  'rename: changing Artist keeps the same UUID id (same row updated, not a new one)',
);
eq(
  buildEntryFromFormData({ ...loadedForm, song: 'New Song' }).id,
  LOADED.id,
  'rename: changing Song keeps the same UUID id',
);

// match_key is the normalized Artist+Song, recomputed on every change. It is
// derived from the CURRENT artist/song, never stored as identity.
eq(
  buildEntryMatchKey('  The   Offspring', 'The Kids  Are Alright  '),
  'the offspring-the kids are alright',
  'matchKey: trims ends, lowercases, collapses internal whitespace (unchanged buildEntryId normalization)',
);
eq(
  buildEntryMatchKey('Old Artist', 'Old Song') !== buildEntryMatchKey('New Artist', 'Old Song'),
  true,
  'matchKey: changes when Artist changes',
);
eq(
  buildEntryMatchKey('Old Artist', 'Old Song') !== buildEntryMatchKey('Old Artist', 'New Song'),
  true,
  'matchKey: changes when Song changes',
);
eq(
  serverBuildEntryMatchKey('A B', 'C D') === buildEntryMatchKey('A B', 'C D'),
  true,
  'matchKey: client (src/utils/savedEntries.js) and server (server/savedEntryMerge.js) copies agree',
);

// Clearing the form drops identity back to null (new-entry state).
eq(
  buildFormDataPatchFromEntry({ artist: '', song: '' }, {}).id,
  null,
  'load of an id-less shape -> formData.id is null (never a derived string)',
);

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
