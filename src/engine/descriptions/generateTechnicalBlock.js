import { renderFrozenTemplate, fillPlaceholdersAndFreeze, fillFrozenPlaceholders } from '../placeholders';
import { pickPooledTemplates, renderPooledTemplates } from '../pooling';

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

// PICK phase: freezes both stages of the Technical block's two-stage pool —
// one raw line per selected tag (Step 1), plus enough lines from the
// remaining tag+base pool to fill out the configured count (Step 2). Frozen
// except via Transformation Tags / Regenerate / entry load-clear.
export function pickTechnicalBlock(selectedTags, projectConfig, ctx) {
  const tagRegistry = projectConfig?.tags || {};
  const baseLines = projectConfig?.description?.templates?.long?.technicalLines || [];

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  // Step 1: pick one raw line per tag (kept raw so Step 2's pool-exclusion
  // check below still compares like-for-like; frozen+filtered separately for
  // output — a tag whose picked line resolves empty contributes no line).
  const perTagLinesRaw = selectedTags
    .map((tag) => {
      const options = getDescriptionTag(tag).technical || [];
      return pickRandom(options);
    })
    .filter(Boolean);

  const perTagFrozen = perTagLinesRaw
    .map((line) => ({ line, ...fillPlaceholdersAndFreeze(line, ctx) }))
    .filter((r) => !r.hasEmpty);

  // Step 2: fill remaining slots from all tag lines, then base defaults
  const allTagLines = selectedTags.flatMap(
    (tag) => getDescriptionTag(tag).technical || [],
  );

  const remainingPool = [...allTagLines, ...baseLines].filter(
    (line) => !perTagLinesRaw.includes(line),
  );

  const technicalLineCount =
    projectConfig?.description?.hookBlockCounts?.technicalLines ??
    projectConfig?.description?.technicalLineCount ??
    3;

  const remainingPicked = pickPooledTemplates(remainingPool, ctx, fillPlaceholdersAndFreeze, {
    count: technicalLineCount - perTagFrozen.length,
  });

  return {
    perTagFrozen: perTagFrozen.map(({ line, frozen }) => ({ template: line, frozen })),
    remainingPicked,
  };
}

// RENDER phase: pure substitution against live ctx — no randomness.
export function renderTechnicalBlock(picked, ctx) {
  const perTagText = picked.perTagFrozen
    .map((frozenTemplate) => renderFrozenTemplate(frozenTemplate, ctx).text)
    .join('\n');

  const remainingText = renderPooledTemplates(picked.remainingPicked, ctx, fillFrozenPlaceholders)?.text ?? '';

  return [perTagText, remainingText].filter(Boolean).join('\n');
}

// Back-compat convenience: pick + render in one call, matching the previous
// single-call signature/shape exactly.
export function generateTechnicalBlock(selectedTags, projectConfig, formData = {}) {
  const ctx = { formData, projectConfig };
  return renderTechnicalBlock(pickTechnicalBlock(selectedTags, projectConfig, ctx), ctx);
}
