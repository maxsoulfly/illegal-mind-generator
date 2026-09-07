import { randomUUID } from 'node:crypto';

import { Router } from 'express';

import { getPool } from '../db.js';
import { buildEntryMatchKey, mergeImportedEntry } from '../savedEntryMerge.js';

const router = Router();

function rowToEntry(row) {
  return {
    id: row.id, // immutable UUID
    matchKey: row.match_key, // normalized Artist+Song — match/dedup only, never identity
    artist: row.artist,
    song: row.song,
    signalNumber: row.signal_number,
    originalYear: row.original_year,
    originalGenre: row.original_genre,
    useCustomArtistShort: row.use_custom_artist_short,
    artistShort: row.artist_short,
    transformationTags: row.transformation_tags,
    customHashtags: row.custom_hashtags,
    customCta: row.custom_cta,
    coverShortHooks: row.cover_short_hooks,
    coverContext: row.cover_context,
    songBlockOverrides: row.song_block_overrides,
    excludeFromRandomizer: row.exclude_from_randomizer,
    todo: { status: row.todo_status, notes: row.todo_notes },
  };
}

async function fetchEntries(queryable, projectId) {
  // Order by match_key (normalized Artist+Song), not the UUID id — keeps the
  // Saved Library list in the same stable, human-meaningful order it had
  // before identity became a UUID.
  const { rows } = await queryable.query(
    'SELECT * FROM saved_entries WHERE project_id = $1 ORDER BY match_key',
    [projectId],
  );
  return rows.map(rowToEntry);
}

async function fetchEntry(queryable, projectId, id) {
  const { rows } = await queryable.query(
    'SELECT * FROM saved_entries WHERE project_id = $1 AND id = $2',
    [projectId, id],
  );
  return rows[0] ? rowToEntry(rows[0]) : null;
}

// Find an existing entry in a project by its normalized Artist+Song match
// key. Used by bulk-add / import to decide "update this existing row" vs
// "insert a new one" — the match key is advisory, so LIMIT 1 (a project
// should hold at most one row per match key, but never rely on that here).
async function fetchEntryByMatchKey(queryable, projectId, matchKey) {
  const { rows } = await queryable.query(
    'SELECT * FROM saved_entries WHERE project_id = $1 AND match_key = $2 LIMIT 1',
    [projectId, matchKey],
  );
  return rows[0] ? rowToEntry(rows[0]) : null;
}

// Wholesale upsert — every column is written from `entry`, matching
// handleSaveEntry's real behavior (buildEntryFromFormData always produces a
// complete entry object; saving always replaces, never merges).
//
// Identity: `entry.id` is an immutable UUID. It comes from the client (an
// existing row being updated, or a client-generated UUID for a new one);
// when absent, a UUID is generated here (and the column also has a
// gen_random_uuid() default as a final safety net). It is NEVER derived
// from Artist+Song. `match_key` is always (re)computed from the current
// Artist+Song so a rename keeps it current.
async function upsertEntry(queryable, projectId, entry) {
  const id = entry.id || randomUUID();
  const matchKey = buildEntryMatchKey(entry.artist || '', entry.song || '');

  const { rows } = await queryable.query(
    `INSERT INTO saved_entries (
       id, project_id, match_key, artist, song, signal_number, original_year, original_genre,
       use_custom_artist_short, artist_short, exclude_from_randomizer,
       custom_hashtags, custom_cta, todo_status, todo_notes,
       transformation_tags, song_block_overrides, cover_short_hooks, cover_context
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,$18::jsonb,$19)
     ON CONFLICT (id) DO UPDATE SET
       match_key = EXCLUDED.match_key,
       artist = EXCLUDED.artist,
       song = EXCLUDED.song,
       signal_number = EXCLUDED.signal_number,
       original_year = EXCLUDED.original_year,
       original_genre = EXCLUDED.original_genre,
       use_custom_artist_short = EXCLUDED.use_custom_artist_short,
       artist_short = EXCLUDED.artist_short,
       exclude_from_randomizer = EXCLUDED.exclude_from_randomizer,
       custom_hashtags = EXCLUDED.custom_hashtags,
       custom_cta = EXCLUDED.custom_cta,
       todo_status = EXCLUDED.todo_status,
       todo_notes = EXCLUDED.todo_notes,
       transformation_tags = EXCLUDED.transformation_tags,
       song_block_overrides = EXCLUDED.song_block_overrides,
       cover_short_hooks = EXCLUDED.cover_short_hooks,
       cover_context = EXCLUDED.cover_context
     RETURNING *`,
    [
      id,
      projectId,
      matchKey,
      entry.artist || '',
      entry.song || '',
      entry.signalNumber || '',
      entry.originalYear || '',
      entry.originalGenre || '',
      Boolean(entry.useCustomArtistShort),
      entry.artistShort || '',
      Boolean(entry.excludeFromRandomizer),
      entry.customHashtags || '',
      entry.customCta || '',
      entry.todo?.status || '',
      entry.todo?.notes || '',
      JSON.stringify(entry.transformationTags || []),
      JSON.stringify(entry.songBlockOverrides || {}),
      JSON.stringify(entry.coverShortHooks || []),
      entry.coverContext || '',
    ],
  );

  return rowToEntry(rows[0]);
}

// GET /saved-entries?project=<projectId>
router.get('/', async (req, res) => {
  const { project } = req.query;

  if (!project) {
    res.status(400).json({ error: 'project query param is required' });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  res.json(await fetchEntries(pool, project));
});

// PUT /saved-entries/:id — wholesale upsert, matches handleSaveEntry. `:id`
// is the entry's immutable UUID (an existing row, or a client-generated
// UUID for a new one); it is authoritative and preserved, so editing
// entry.artist / entry.song renames the SAME row rather than creating a
// second one. No Artist+Song match-key reuse here — the client owns
// duplicate resolution (ConfirmDialog) before it picks the id.
// Body: { projectId, entry }
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { projectId, entry } = req.body || {};

  if (!projectId || !entry || typeof entry !== 'object' || !entry.artist || !entry.song) {
    res.status(400).json({
      error: 'projectId (string) and entry (object with artist/song) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const saved = await upsertEntry(pool, projectId, { ...entry, id });
  res.json(saved);
});

// PATCH /saved-entries/:id — partial update, matches handleUpdateEntry's
// `{...entry, ...updates}` shallow spread exactly: read the current row,
// merge in JS with the same semantics, write back. A field present in
// `updates` (including nested objects like songBlockOverrides/todo) fully
// replaces that field, not a deep merge — intentional, matches the client.
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { projectId, updates } = req.body || {};

  if (!projectId || typeof updates !== 'object' || updates === null) {
    res.status(400).json({ error: 'projectId (string) and updates (object) are required' });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const existing = await fetchEntry(pool, projectId, id);
  if (!existing) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  const merged = { ...existing, ...updates, id };
  res.json(await upsertEntry(pool, projectId, merged));
});

// PATCH /saved-entries/:id/todo — matches handleUpdateEntryTodo (a real
// no-op, not an error, if the entry doesn't exist — same as the client,
// which just maps over the array and leaves it unchanged on no match).
// Body: { projectId, status, notes }
router.patch('/:id/todo', async (req, res) => {
  const { id } = req.params;
  const { projectId, status, notes } = req.body || {};

  if (!projectId) {
    res.status(400).json({ error: 'projectId (string) is required' });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const { rows } = await pool.query(
    `UPDATE saved_entries SET todo_status = $3, todo_notes = $4
     WHERE project_id = $1 AND id = $2
     RETURNING *`,
    [projectId, id, status || '', notes || ''],
  );

  res.json(rows[0] ? rowToEntry(rows[0]) : null);
});

// DELETE /saved-entries/:id?project=<projectId> — matches handleDeleteEntry.
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { project } = req.query;

  if (!project) {
    res.status(400).json({ error: 'project query param is required' });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  await pool.query('DELETE FROM saved_entries WHERE project_id = $1 AND id = $2', [
    project,
    id,
  ]);

  res.json({ projectId: project, id, deleted: true });
});

// POST /saved-entries/bulk — matches handleAddEntries: dedupe the incoming
// batch by normalized Artist+Song match key (first occurrence wins), then
// per item resolve that match key against the project — an existing row is
// updated in place (its UUID reused), a new match key inserts a fresh UUID
// row. Batch behavior only — never an interactive confirm here.
// Body: { projectId, entries }
router.post('/bulk', async (req, res) => {
  const { projectId, entries } = req.body || {};

  if (!projectId || !Array.isArray(entries)) {
    res.status(400).json({ error: 'projectId (string) and entries (array) are required' });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const seen = new Set();
  const deduped = entries.filter((entry) => {
    const key = buildEntryMatchKey(entry.artist || '', entry.song || '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const entry of deduped) {
      const key = buildEntryMatchKey(entry.artist || '', entry.song || '');
      const existing = await fetchEntryByMatchKey(client, projectId, key);
      await upsertEntry(client, projectId, { ...entry, id: existing?.id });
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
    return;
  } finally {
    client.release();
  }

  res.json({ projectId, addedCount: deduped.length, entries: await fetchEntries(pool, projectId) });
});

// POST /saved-entries/import — matches handleImportEntries's real behavior:
// per item, merge against any existing row via mergeImportedEntry (the
// non-destructive, field-by-field merge — see CLAUDE.md's Known Gotchas for
// why this exists and must not be simplified to a wholesale replace), then
// upsert the merged result. Body: { projectId, items }
router.post('/import', async (req, res) => {
  const { projectId, items } = req.body || {};

  if (!projectId || !Array.isArray(items)) {
    res.status(400).json({ error: 'projectId (string) and items (array) are required' });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const validItems = items.filter(
    (item) => item && typeof item.artist === 'string' && typeof item.song === 'string',
  );

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of validItems) {
      const key = buildEntryMatchKey(item.artist, item.song);
      const existing = await fetchEntryByMatchKey(client, projectId, key);
      // mergeImportedEntry carries `existing?.id` through (or undefined for a
      // new row -> upsertEntry assigns a UUID). Never derived from Artist+Song.
      const merged = mergeImportedEntry(item, existing);
      await upsertEntry(client, projectId, merged);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
    return;
  } finally {
    client.release();
  }

  res.json({
    projectId,
    importedCount: validItems.length,
    entries: await fetchEntries(pool, projectId),
  });
});

export default router;
