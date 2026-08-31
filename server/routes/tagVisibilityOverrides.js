import { Router } from 'express';

import { getPool } from '../db.js';

const router = Router();

// GET /tag-visibility-overrides?project=<projectId>
// Returns { [tagName]: boolean }, matching the shape of
// illegalMindGeneratorData.tagVisibilityOverrides[projectId] today — the
// Step 7 hook swap can drop this straight into useTagVisibilityOverrides.js
// with no reshaping.
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

  const { rows } = await pool.query(
    'SELECT tag_name, visible FROM tag_visibility_overrides WHERE project_id = $1',
    [project],
  );

  const overrides = Object.fromEntries(rows.map((row) => [row.tag_name, row.visible]));
  res.json(overrides);
});

// PUT /tag-visibility-overrides — upsert one (projectId, tagName) row.
// Body: { projectId, tagName, visible }
router.put('/', async (req, res) => {
  const { projectId, tagName, visible } = req.body || {};

  if (!projectId || !tagName || typeof visible !== 'boolean') {
    res.status(400).json({
      error: 'projectId (string), tagName (string) and visible (boolean) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  await pool.query(
    `INSERT INTO tag_visibility_overrides (project_id, tag_name, visible)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, tag_name) DO UPDATE SET visible = EXCLUDED.visible`,
    [projectId, tagName, visible],
  );

  res.json({ projectId, tagName, visible });
});

export default router;
