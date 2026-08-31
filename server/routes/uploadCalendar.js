import { Router } from 'express';

import { getPool } from '../db.js';

const router = Router();

function rowToSlot(row) {
  return {
    isoDate: row.iso_date,
    videoType: row.video_type,
    plannedEntryId: row.planned_entry_id,
    uploadedEntryId: row.uploaded_entry_id,
  };
}

async function fetchSlots(queryable, projectId) {
  const { rows } = await queryable.query(
    'SELECT * FROM upload_calendar_slots WHERE project_id = $1 ORDER BY iso_date, video_type',
    [projectId],
  );

  return rows.map(rowToSlot);
}

// GET /upload-calendar?project=<projectId>
// Returns { slots: [{isoDate, videoType, plannedEntryId, uploadedEntryId}] }
// for the whole project — building a specific month's grid (getMonthGrid)
// stays a client-side concern, same as today; this deliberately doesn't
// filter by year/month server-side, matching how every other domain's GET
// in this migration returns the full project set and lets the client
// derive views from it.
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

  res.json({ slots: await fetchSlots(pool, project) });
});

// PUT /upload-calendar/slot — patch semantics matching patchSlot exactly:
// merge `patch` onto the existing slot (or a blank one), then either upsert
// the result or delete the row entirely if both fields end up null/absent —
// a slot with nothing planned or uploaded isn't stored at all, same as
// today. Covers setPlannedEntry/setUploadedEntry/clearPlannedEntry/
// clearUploadedEntry/confirmUploadedAsPlanned, all of which are just
// different patch shapes from the client's perspective.
// Body: { projectId, isoDate, videoType, patch: {plannedEntryId?, uploadedEntryId?} }
router.put('/slot', async (req, res) => {
  const { projectId, isoDate, videoType, patch } = req.body || {};

  if (!projectId || !isoDate || !videoType || typeof patch !== 'object' || patch === null) {
    res.status(400).json({
      error: 'projectId, isoDate, videoType (strings) and patch (object) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const { rows: existingRows } = await pool.query(
    'SELECT * FROM upload_calendar_slots WHERE project_id = $1 AND iso_date = $2 AND video_type = $3',
    [projectId, isoDate, videoType],
  );
  const current = existingRows[0]
    ? rowToSlot(existingRows[0])
    : { plannedEntryId: null, uploadedEntryId: null };

  const next = { ...current, ...patch };

  if (!next.plannedEntryId && !next.uploadedEntryId) {
    await pool.query(
      'DELETE FROM upload_calendar_slots WHERE project_id = $1 AND iso_date = $2 AND video_type = $3',
      [projectId, isoDate, videoType],
    );
    res.json({ projectId, isoDate, videoType, slot: null });
    return;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO upload_calendar_slots (project_id, iso_date, video_type, planned_entry_id, uploaded_entry_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (project_id, iso_date, video_type) DO UPDATE SET
         planned_entry_id = EXCLUDED.planned_entry_id,
         uploaded_entry_id = EXCLUDED.uploaded_entry_id
       RETURNING *`,
      [projectId, isoDate, videoType, next.plannedEntryId || null, next.uploadedEntryId || null],
    );
    res.json({ projectId, isoDate, videoType, slot: rowToSlot(rows[0]) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /upload-calendar/slot?project=&isoDate=&videoType= — matches
// removeSlot (unconditional delete, a no-op if the slot didn't exist).
router.delete('/slot', async (req, res) => {
  const { project, isoDate, videoType } = req.query;

  if (!project || !isoDate || !videoType) {
    res.status(400).json({
      error: 'project, isoDate and videoType query params are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  await pool.query(
    'DELETE FROM upload_calendar_slots WHERE project_id = $1 AND iso_date = $2 AND video_type = $3',
    [project, isoDate, videoType],
  );

  res.json({ projectId: project, isoDate, videoType, deleted: true });
});

export default router;
