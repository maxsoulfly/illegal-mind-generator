import { Router } from 'express';

import { getPool } from '../db.js';
import { getBaseTags } from '../projectsConfig.js';
import { buildEffectiveTag, mergeTagData } from '../tagMerge.js';

const router = Router();

// A row's scalar columns are only meaningful when non-null — NULL means
// "not part of the override," so it's omitted from the reconstructed object
// entirely rather than included as `null`. Matches localStorage's shape,
// where an unset field simply isn't a key on the override object.
function rowToOverride(row) {
  const override = { ...(row.payload || {}) };

  if (row.label !== null) override.label = row.label;
  if (row.category !== null) override.category = row.category;
  if (row.visible !== null) override.visible = row.visible;
  if (row.is_custom !== null) override.isCustom = row.is_custom;

  return override;
}

function splitOverride(overrideObject = {}) {
  const { label, category, visible, isCustom, ...rest } = overrideObject;

  return {
    label: label ?? null,
    category: category ?? null,
    visible: typeof visible === 'boolean' ? visible : null,
    isCustom: typeof isCustom === 'boolean' ? isCustom : null,
    payload: rest,
  };
}

async function fetchProjectOverrides(queryable, projectId) {
  const { rows } = await queryable.query(
    'SELECT tag_name, label, category, visible, is_custom, payload FROM tag_overrides WHERE project_id = $1',
    [projectId],
  );

  return Object.fromEntries(rows.map((row) => [row.tag_name, rowToOverride(row)]));
}

// Partial-update upsert — matches updateTagOverride's `{...prev, ...updates}`
// shallow merge. Scalar columns keep their existing value when the update
// doesn't mention that field (COALESCE); payload is merged one level deep
// via Postgres's `||` jsonb operator, the same shallow-merge semantics as a
// JS object spread.
async function upsertMergeOverride(queryable, projectId, tagName, updates) {
  const { label, category, visible, isCustom, payload } = splitOverride(updates);

  const { rows } = await queryable.query(
    `INSERT INTO tag_overrides (project_id, tag_name, label, category, visible, is_custom, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     ON CONFLICT (project_id, tag_name) DO UPDATE SET
       label = COALESCE(EXCLUDED.label, tag_overrides.label),
       category = COALESCE(EXCLUDED.category, tag_overrides.category),
       visible = COALESCE(EXCLUDED.visible, tag_overrides.visible),
       is_custom = COALESCE(EXCLUDED.is_custom, tag_overrides.is_custom),
       payload = tag_overrides.payload || EXCLUDED.payload
     RETURNING tag_name, label, category, visible, is_custom, payload`,
    [projectId, tagName, label, category, visible, isCustom, JSON.stringify(payload)],
  );

  return rowToOverride(rows[0]);
}

// Wholesale replace — used by sync/copy-tag, whose merge algorithm already
// computes the complete new override object for a tag (not a partial patch
// to layer on top of whatever was there).
async function replaceOverride(queryable, projectId, tagName, overrideObject) {
  const { label, category, visible, isCustom, payload } = splitOverride(overrideObject);

  const { rows } = await queryable.query(
    `INSERT INTO tag_overrides (project_id, tag_name, label, category, visible, is_custom, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     ON CONFLICT (project_id, tag_name) DO UPDATE SET
       label = EXCLUDED.label,
       category = EXCLUDED.category,
       visible = EXCLUDED.visible,
       is_custom = EXCLUDED.is_custom,
       payload = EXCLUDED.payload
     RETURNING tag_name, label, category, visible, is_custom, payload`,
    [projectId, tagName, label, category, visible, isCustom, JSON.stringify(payload)],
  );

  return rowToOverride(rows[0]);
}

// GET /tag-overrides?project=<projectId>
// Returns { [tagName]: overrideObject }, matching
// illegalMindGeneratorData.tagOverrides[projectId] today.
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

  res.json(await fetchProjectOverrides(pool, project));
});

// PUT /tag-overrides — single-tag partial-update upsert, matches
// updateTagOverride. Body: { projectId, tagName, updates }
router.put('/', async (req, res) => {
  const { projectId, tagName, updates } = req.body || {};

  if (!projectId || !tagName || typeof updates !== 'object' || updates === null) {
    res.status(400).json({
      error: 'projectId (string), tagName (string) and updates (object) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const override = await upsertMergeOverride(pool, projectId, tagName, updates);
  res.json({ projectId, tagName, override });
});

// DELETE /tag-overrides/:tagName?project=<projectId> — matches
// resetTagOverride (removes the row entirely, reverting to the base tag).
router.delete('/:tagName', async (req, res) => {
  const { tagName } = req.params;
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

  await pool.query('DELETE FROM tag_overrides WHERE project_id = $1 AND tag_name = $2', [
    project,
    tagName,
  ]);

  res.json({ projectId: project, tagName, deleted: true });
});

// POST /tag-overrides/sync — matches syncProjectTags: merges every tag from
// sourceProjectId into targetProjectId (source overrides first, then
// base-only source tags), writing the result to targetProjectId's rows.
// Body: { sourceProjectId, targetProjectId }
router.post('/sync', async (req, res) => {
  const { sourceProjectId, targetProjectId } = req.body || {};

  if (!sourceProjectId || !targetProjectId || sourceProjectId === targetProjectId) {
    res.status(400).json({
      error: 'sourceProjectId and targetProjectId (different) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const sourceBaseTags = getBaseTags(sourceProjectId);
  const targetBaseTags = getBaseTags(targetProjectId);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sourceOverrides = await fetchProjectOverrides(client, sourceProjectId);
    const targetOverrides = await fetchProjectOverrides(client, targetProjectId);

    const processedTags = new Set();
    const writes = [];

    // Step 1: source overrides (custom tags + base tags with user edits) —
    // highest fidelity, since they include real user additions.
    for (const [tagName, sourceOverride] of Object.entries(sourceOverrides)) {
      processedTags.add(tagName);

      const sourceEffective = buildEffectiveTag(sourceBaseTags[tagName], sourceOverride);
      const targetEffective = buildEffectiveTag(targetBaseTags[tagName], targetOverrides[tagName]);
      const tagExistsInTarget = Boolean(targetBaseTags[tagName]) || Boolean(targetOverrides[tagName]);

      const nextOverride = tagExistsInTarget
        ? mergeTagData(targetEffective, sourceEffective)
        : { ...sourceOverride, isCustom: true };

      writes.push([tagName, nextOverride]);
    }

    // Step 2: base-only source tags that had no overrides — copies
    // project-specific base templates into the target's overrides.
    for (const [tagName, sourceBaseTag] of Object.entries(sourceBaseTags)) {
      if (processedTags.has(tagName)) continue;

      const targetEffective = buildEffectiveTag(targetBaseTags[tagName], targetOverrides[tagName]);
      writes.push([tagName, mergeTagData(targetEffective, sourceBaseTag)]);
    }

    for (const [tagName, nextOverride] of writes) {
      await replaceOverride(client, targetProjectId, tagName, nextOverride);
    }

    await client.query('COMMIT');

    res.json(await fetchProjectOverrides(client, targetProjectId));
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// POST /tag-overrides/copy-tag — matches copyTagFromProject: merges one
// specific tag from sourceProjectId into targetProjectId.
// Body: { tagName, sourceProjectId, targetProjectId }
router.post('/copy-tag', async (req, res) => {
  const { tagName, sourceProjectId, targetProjectId } = req.body || {};

  if (!tagName || !sourceProjectId || !targetProjectId || sourceProjectId === targetProjectId) {
    res.status(400).json({
      error: 'tagName, sourceProjectId and targetProjectId (different) are required',
    });
    return;
  }

  const pool = getPool();
  if (!pool) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  const sourceBaseTags = getBaseTags(sourceProjectId);
  const targetBaseTags = getBaseTags(targetProjectId);

  const sourceOverrides = await fetchProjectOverrides(pool, sourceProjectId);
  const targetOverrides = await fetchProjectOverrides(pool, targetProjectId);

  const sourceEffective = buildEffectiveTag(sourceBaseTags[tagName], sourceOverrides[tagName]);
  const targetEffective = buildEffectiveTag(targetBaseTags[tagName], targetOverrides[tagName]);
  const nextOverride = mergeTagData(targetEffective, sourceEffective);

  const override = await replaceOverride(pool, targetProjectId, tagName, nextOverride);
  res.json({ tagName, override });
});

export default router;
