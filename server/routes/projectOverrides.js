import { Router } from 'express';

import { getPool } from '../db.js';

const router = Router();

async function fetchSettings(pool, projectId) {
  const { rows } = await pool.query(
    'SELECT settings FROM project_overrides WHERE project_id = $1',
    [projectId],
  );

  return rows[0]?.settings || {};
}

// GET /project-overrides?project=<projectId>
// Returns the settings object, matching
// illegalMindGeneratorData.projectOverrides[projectId] today.
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

  res.json(await fetchSettings(pool, project));
});

// PATCH /project-overrides — shallow-merges `updates` into the top level of
// `settings`, matching updateProjectOverride's `{...current, ...updates}`
// exactly: a top-level key's value is replaced wholesale by the update, not
// deep-merged. Postgres's jsonb `||` operator has the same shallow-merge
// semantics, so this is a single upsert, no read-modify-write round trip
// needed. Body: { projectId, updates }
router.patch('/', async (req, res) => {
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

  const { rows } = await pool.query(
    `INSERT INTO project_overrides (project_id, settings)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (project_id) DO UPDATE SET settings = project_overrides.settings || EXCLUDED.settings
     RETURNING settings`,
    [projectId, JSON.stringify(updates)],
  );

  res.json({ projectId, settings: rows[0].settings });
});

// DELETE /project-overrides/:field?project=<projectId> — matches
// resetProjectOverride (removes one top-level settings key entirely).
router.delete('/:field', async (req, res) => {
  const { field } = req.params;
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

  const { rows } = await pool.query(
    `UPDATE project_overrides SET settings = settings - $2
     WHERE project_id = $1
     RETURNING settings`,
    [project, field],
  );

  res.json({ projectId: project, field, settings: rows[0]?.settings || {} });
});

// PUT /project-overrides/short-hook-types — matches syncHookTypesToProject:
// a cross-project write that wholesale-sets settings.shortHookTypes for
// targetProjectId (which need not be the caller's own project).
// Body: { targetProjectId, hookTypes }
router.put('/short-hook-types', async (req, res) => {
  const { targetProjectId, hookTypes } = req.body || {};

  if (!targetProjectId || typeof hookTypes !== 'object' || hookTypes === null) {
    res.status(400).json({
      error: 'targetProjectId (string) and hookTypes (object) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const { rows } = await pool.query(
    `INSERT INTO project_overrides (project_id, settings)
     VALUES ($1, jsonb_build_object('shortHookTypes', $2::jsonb))
     ON CONFLICT (project_id) DO UPDATE SET
       settings = project_overrides.settings || jsonb_build_object('shortHookTypes', $2::jsonb)
     RETURNING settings`,
    [targetProjectId, JSON.stringify(hookTypes)],
  );

  res.json({ projectId: targetProjectId, settings: rows[0].settings });
});

export default router;
