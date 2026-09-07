// Smoke test: the order of formData.transformationTags is a preserved,
// intentional priority (first = most important) — drag-reorder in the tag
// selector writes a new order, and it must survive a save -> load round-trip
// and a JSON library import. Plain-array passthrough today; this guards
// against a future "sort tags on save" style regression.
//
// Run: npx rolldown src/utils/savedEntries.test.js -f esm -p node \
//        -o /tmp/se.test.mjs && node /tmp/se.test.mjs

import { buildEntryFromFormData, buildFormDataPatchFromEntry } from './savedEntries';
import { mergeImportedEntry } from '../../server/savedEntryMerge.js';

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

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
