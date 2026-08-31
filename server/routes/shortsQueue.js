import { Router } from 'express';

import { getPool } from '../db.js';
import { getValidReplacement, getQueueCandidates } from '../shortsQueueMerge.js';

const router = Router();

async function fetchQueueIds(queryable, projectId) {
  const { rows } = await queryable.query(
    'SELECT saved_entry_id FROM shorts_queue_items WHERE project_id = $1 ORDER BY position',
    [projectId],
  );

  return rows.map((row) => row.saved_entry_id);
}

// Only the fields getQueueCandidates/getValidReplacement/getCoverId
// actually need — not the full saved_entries row shape.
async function fetchSavedEntriesForQueue(queryable, projectId) {
  const { rows } = await queryable.query(
    'SELECT id, artist, song, exclude_from_randomizer FROM saved_entries WHERE project_id = $1',
    [projectId],
  );

  return rows.map((row) => ({
    id: row.id,
    artist: row.artist,
    song: row.song,
    excludeFromRandomizer: row.exclude_from_randomizer,
  }));
}

// Whole-list replace: delete every row for this project, reinsert in order.
// The foreign key on saved_entry_id means a bogus id fails the whole
// transaction instead of silently persisting a broken reference.
async function replaceQueue(client, projectId, queueIds) {
  await client.query('DELETE FROM shorts_queue_items WHERE project_id = $1', [projectId]);

  for (let position = 0; position < queueIds.length; position += 1) {
    await client.query(
      'INSERT INTO shorts_queue_items (project_id, position, saved_entry_id) VALUES ($1, $2, $3)',
      [projectId, position, queueIds[position]],
    );
  }
}

// GET /shorts-queue?project=<projectId>
// Returns { queue: entryId[] } — matches
// illegalMindGeneratorData.shortsQueues[projectId].queue today. Resolving
// ids to full saved-entry data stays a client-side concern (same as today —
// only the id list is ever persisted).
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

  res.json({ queue: await fetchQueueIds(pool, project) });
});

// PUT /shorts-queue — wholesale replace, matches randomizeQueue's real
// storage shape (the randomization pick itself stays a client-side concern
// until Step 11 — this endpoint just durably stores whatever ordered list
// it's given). Body: { projectId, queueIds }
router.put('/', async (req, res) => {
  const { projectId, queueIds } = req.body || {};

  if (!projectId || !Array.isArray(queueIds)) {
    res.status(400).json({ error: 'projectId (string) and queueIds (array) are required' });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await replaceQueue(client, projectId, queueIds);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
    return;
  } finally {
    client.release();
  }

  res.json({ projectId, queue: queueIds });
});

// POST /shorts-queue/mark-uploaded — matches markUploaded: remove one
// position, find and append a valid replacement (respecting duplicate
// spacing and excludeFromRandomizer), all inside one transaction so the
// remove+refill can't split across two round trips.
// Body: { projectId, indexToRemove, spacing }
router.post('/mark-uploaded', async (req, res) => {
  const { projectId, indexToRemove, spacing } = req.body || {};

  if (!projectId || typeof indexToRemove !== 'number' || typeof spacing !== 'number') {
    res.status(400).json({
      error: 'projectId (string), indexToRemove (number) and spacing (number) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentQueueIds = await fetchQueueIds(client, projectId);
    const nextQueueIds = currentQueueIds.filter((_, index) => index !== indexToRemove);

    const savedEntries = await fetchSavedEntriesForQueue(client, projectId);
    const candidates = getQueueCandidates(savedEntries);
    const replacement = getValidReplacement(candidates, nextQueueIds, spacing);

    if (replacement) nextQueueIds.push(replacement);

    await replaceQueue(client, projectId, nextQueueIds);
    await client.query('COMMIT');

    res.json({ projectId, queue: nextQueueIds, replacementAdded: Boolean(replacement) });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;
