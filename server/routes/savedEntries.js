import { Router } from 'express';

import { getPool } from '../db.js';
import { buildEntryId, mergeImportedEntry } from '../savedEntryMerge.js';

const router = Router();

function rowToEntry(row) {
  return {
    id: row.id,
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
    songBlockOverrides: row.song_block_overrides,
    excludeFromRandomizer: row.exclude_from_randomizer,
    todo: { status: row.todo_status, notes: row.todo_notes },
  };
}

async function fetchEntries(queryable, projectId) {
  const { rows } = await queryable.query(
    'SELECT * FROM saved_entries WHERE project_id = $1 ORDER BY id',
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

// Wholesale upsert — every column is written from `entry`, matching
// handleSaveEntry's real behavior (buildEntryFromFormData always produces a
// complete entry object; saving always replaces, never merges).
async function upsertEntry(queryable, projectId, entry) {
  const id = entry.id || buildEntryId(entry.artist, entry.song);

  const { rows } = await queryable.query(
    `INSERT INTO saved_entries (
       id, project_id, artist, song, signal_number, original_year, original_genre,
       use_custom_artist_short, artist_short, exclude_from_randomizer,
       custom_hashtags, custom_cta, todo_status, todo_notes,
       transformation_tags, song_block_overrides, cover_short_hooks
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17::jsonb)
     ON CONFLICT (project_id, id) DO UPDATE SET
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
       cover_short_hooks = EXCLUDED.cover_short_hooks
     RETURNING *`,
    [
      id,
      projectId,
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

// PUT /saved-entries/:id — wholesale upsert, matches handleSaveEntry.
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
// batch by computed id (first occurrence wins, same as normalizeEntryIds),
// then wholesale-upsert each — a new entry fully replaces any existing one
// sharing its id, exactly like the client's filter-out-then-prepend logic.
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
    const id = buildEntryId(entry.artist || '', entry.song || '');
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const entry of deduped) {
      await upsertEntry(client, projectId, entry);
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
      const id = buildEntryId(item.artist, item.song);
      const existing = await fetchEntry(client, projectId, id);
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
