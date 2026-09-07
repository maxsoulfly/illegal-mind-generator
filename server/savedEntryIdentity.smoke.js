// API-level lock-in smoke test for the Saved Entry UUID identity model
// (2026-09-08 refactor, migrations 0009-0012). Manual — needs the API server
// running against the Neon dev branch (npm run dev, or npm run dev:server).
// Creates only throwaway `ZZQA Identity Smoke` rows and deletes every one it
// makes; asserts the DB row count is back to baseline at the end.
//
//   node server/savedEntryIdentity.smoke.js
//
// Contracts covered:
//  - a UUID id survives an Artist rename and a Song rename (same row updated)
//  - match_key is recomputed from the current Artist+Song on every write
//  - PUT does NOT dedupe on Artist+Song — a fresh UUID makes a new row
//    (duplicate prevention is the client's ConfirmDialog, not the server)
//  - bulk / import resolve an existing row by match_key and reuse its UUID
//  - import stays non-destructive
//  - Calendar stores UUID references and rejects a non-UUID
//  - deleting a Calendar-referenced entry is ON DELETE SET NULL, not cascade
//  - DELETE returns a non-2xx (not a false success) on a DB error

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const dir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(dir, '.env'), quiet: true });

const PORT = process.env.PORT || 8787;
const KEY = process.env.API_KEY;
const BASE = `http://localhost:${PORT}`;
const PROJECT = process.argv[2] || 'maxxDeeCovers';

if (!KEY) {
  console.error('API_KEY not set in server/.env');
  process.exit(1);
}

const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` };
const api = (method, p, body) =>
  fetch(BASE + p, { method, headers: H, body: body === undefined ? undefined : JSON.stringify(body) });
const jsonOf = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
let pass = 0;
let fail = 0;
const chk = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? `  -> ${detail}` : ''}`);
  ok ? (pass += 1) : (fail += 1);
};

const listEntries = async () => jsonOf(await api('GET', `/saved-entries?project=${PROJECT}`));
const mkEntry = (id, song, extra = {}) =>
  api('PUT', `/saved-entries/${id}`, {
    projectId: PROJECT,
    entry: {
      id,
      artist: 'ZZQA Identity Smoke',
      song,
      signalNumber: '01',
      transformationTags: [],
      songBlockOverrides: {},
      todo: { status: '', notes: '' },
      ...extra,
    },
  });

const created = new Set();
const CAL = { isoDate: '2099-10-01', videoType: 'short' };
const CAL2 = { isoDate: '2099-10-08', videoType: 'short' };

async function main() {
  const baseline = (await listEntries()).length;
  console.log(`project ${PROJECT} | baseline ${baseline}\n`);

  // 1. new entry -> one UUID
  const id1 = crypto.randomUUID();
  const e1 = await jsonOf(await mkEntry(id1, 'Alpha'));
  created.add(id1);
  chk('new PUT returns the client UUID unchanged', e1.id === id1, e1.id);
  chk('new PUT computes match_key from Artist+Song', e1.matchKey === 'zzqa identity smoke-alpha', e1.matchKey);

  // 2. rename Song -> same UUID, match_key follows, no new row
  const e2 = await jsonOf(await mkEntry(id1, 'Beta'));
  chk('Song rename keeps the same UUID', e2.id === id1, e2.id);
  chk('Song rename updates match_key', e2.matchKey === 'zzqa identity smoke-beta', e2.matchKey);
  chk('Song rename song text updated', e2.song === 'Beta', e2.song);

  // 3. rename Artist -> same UUID
  const e3 = await jsonOf(
    await api('PUT', `/saved-entries/${id1}`, {
      projectId: PROJECT,
      entry: { id: id1, artist: 'ZZQA Renamed Artist', song: 'Beta', transformationTags: [], songBlockOverrides: {}, todo: {} },
    }),
  );
  chk('Artist rename keeps the same UUID', e3.id === id1, e3.id);
  chk('Artist rename updates match_key', e3.matchKey === 'zzqa renamed artist-beta', e3.matchKey);
  chk('after two renames: still exactly one row for this UUID', (await listEntries()).filter((e) => e.id === id1).length === 1);
  chk('after two renames: row count grew by exactly 1', (await listEntries()).length === baseline + 1);

  // put it back to a stable name for the matching tests
  await mkEntry(id1, 'Beta');

  // 4. PUT does NOT dedupe on Artist+Song — a fresh UUID = a new row
  const idDup = crypto.randomUUID();
  await mkEntry(idDup, 'Beta'); // same Artist+Song as id1, different UUID
  created.add(idDup);
  const betaRows = (await listEntries()).filter((e) => e.matchKey === 'zzqa identity smoke-beta');
  chk('PUT with a fresh UUID for an existing Artist+Song creates a SECOND row (client owns the confirm)', betaRows.length === 2, betaRows.length);
  await api('DELETE', `/saved-entries/${idDup}?project=${PROJECT}`);
  created.delete(idDup);

  // 5. bulk reuses the matched UUID, inserts a fresh one for a new match_key
  const bulk = await jsonOf(
    await api('POST', '/saved-entries/bulk', {
      projectId: PROJECT,
      entries: [
        { artist: 'ZZQA Identity Smoke', song: 'Beta', signalNumber: '99', transformationTags: [], songBlockOverrides: {}, todo: {} },
        { artist: 'ZZQA Identity Smoke', song: 'Gamma', transformationTags: [], songBlockOverrides: {}, todo: {} },
      ],
    }),
  );
  const bBeta = bulk.entries.find((e) => e.matchKey === 'zzqa identity smoke-beta');
  const bGamma = bulk.entries.find((e) => e.matchKey === 'zzqa identity smoke-gamma');
  chk('bulk reuses the existing UUID for a matching Artist+Song', bBeta && bBeta.id === id1, bBeta && bBeta.id);
  chk('bulk updated the existing row (signalNumber 99)', bBeta && bBeta.signalNumber === '99', bBeta && bBeta.signalNumber);
  chk('bulk inserts a fresh UUID for a new match_key', bGamma && UUID.test(bGamma.id) && bGamma.id !== id1, bGamma && bGamma.id);
  if (bGamma) created.add(bGamma.id);

  // 6. import reuses the matched UUID and is non-destructive
  await mkEntry(id1, 'Beta', { coverContext: 'ctx-keep', originalGenre: 'metal' });
  const imp = await jsonOf(
    await api('POST', '/saved-entries/import', {
      projectId: PROJECT,
      items: [{ artist: 'ZZQA Identity Smoke', song: 'Beta', originalYear: '2001' }],
    }),
  );
  const iBeta = imp.entries.find((e) => e.matchKey === 'zzqa identity smoke-beta');
  chk('import reuses the existing UUID', iBeta && iBeta.id === id1, iBeta && iBeta.id);
  chk('import applied the thin field (originalYear)', iBeta && iBeta.originalYear === '2001', iBeta && iBeta.originalYear);
  chk('import kept coverContext (non-destructive)', iBeta && iBeta.coverContext === 'ctx-keep', iBeta && iBeta.coverContext);
  chk('import kept originalGenre (non-destructive)', iBeta && iBeta.originalGenre === 'metal', iBeta && iBeta.originalGenre);

  // 7. Calendar stores UUID refs, rejects a non-UUID
  const okSlot = await jsonOf(await api('PUT', '/upload-calendar/slot', { projectId: PROJECT, ...CAL, patch: { plannedEntryId: id1 } }));
  await api('PUT', '/upload-calendar/slot', { projectId: PROJECT, ...CAL2, patch: { uploadedEntryId: id1 } });
  chk('Calendar slot stores the entry UUID', okSlot.slot && okSlot.slot.plannedEntryId === id1, okSlot.slot && okSlot.slot.plannedEntryId);
  const badSlot = await api('PUT', '/upload-calendar/slot', { projectId: PROJECT, isoDate: '2099-10-15', videoType: 'short', patch: { plannedEntryId: 'zzqa identity smoke-beta' } });
  chk('Calendar rejects a non-UUID (old text id) reference', badSlot.status >= 400, badSlot.status);

  // 8. delete a Calendar-referenced entry -> SET NULL, not cascade
  const del = await api('DELETE', `/saved-entries/${id1}?project=${PROJECT}`);
  const delBody = await jsonOf(del);
  created.delete(id1);
  chk('DELETE of a referenced entry succeeds (2xx)', del.ok, del.status);
  chk('DELETE response shape unchanged', delBody && delBody.deleted === true && delBody.id === id1, JSON.stringify(delBody));
  const cal = await jsonOf(await api('GET', `/upload-calendar?project=${PROJECT}`));
  const s1 = (cal.slots || []).find((s) => s.isoDate === CAL.isoDate && s.videoType === CAL.videoType);
  const s2 = (cal.slots || []).find((s) => s.isoDate === CAL2.isoDate && s.videoType === CAL2.videoType);
  chk('planned Calendar slot ROW survived the delete', !!s1, JSON.stringify(s1));
  chk('uploaded Calendar slot ROW survived the delete', !!s2, JSON.stringify(s2));
  chk('planned_entry_id was SET NULL (not cascaded)', s1 && s1.plannedEntryId === null, s1 && s1.plannedEntryId);
  chk('uploaded_entry_id was SET NULL (not cascaded)', s2 && s2.uploadedEntryId === null, s2 && s2.uploadedEntryId);

  // 9. DELETE returns non-2xx on a DB error (not a false success)
  const badDel = await api('DELETE', `/saved-entries/not-a-uuid?project=${PROJECT}`);
  const badDelBody = await jsonOf(badDel);
  chk('DELETE returns non-2xx on a DB error', !badDel.ok && (!badDelBody || badDelBody.deleted === undefined), `${badDel.status} ${JSON.stringify(badDelBody)}`);
}

try {
  await main();
} catch (err) {
  console.error('\nSMOKE ERROR:', err && err.stack ? err.stack : err);
  fail += 1;
} finally {
  for (const id of created) await api('DELETE', `/saved-entries/${id}?project=${PROJECT}`).catch(() => {});
  for (const c of [CAL, CAL2, { isoDate: '2099-10-15', videoType: 'short' }]) {
    await api('DELETE', `/upload-calendar/slot?project=${PROJECT}&isoDate=${c.isoDate}&videoType=${c.videoType}`).catch(() => {});
  }
  const finalN = (await listEntries()).length;
  console.log(`\ncleanup: ${finalN} rows (started at ${await listEntries().then((r) => r.length)} check)`);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}
