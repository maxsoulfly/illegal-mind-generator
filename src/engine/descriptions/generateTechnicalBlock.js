import { fillPlaceholders } from '../placeholders';
import { resolvePooledOutput } from '../pooling';

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function generateTechnicalBlock(selectedTags, projectConfig, formData = {}) {
  const tagRegistry = projectConfig?.tags || {};
  const baseLines = projectConfig?.description?.templates?.long?.technicalLines || [];
  const ctx = { formData, projectConfig };

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  // Step 1: pick one raw line per tag (kept raw so Step 2's pool-exclusion
  // check below still compares like-for-like; filled+filtered separately for
  // output — a tag whose picked line resolves empty contributes no line).
  const perTagLinesRaw = selectedTags
    .map((tag) => {
      const options = getDescriptionTag(tag).technical || [];
      return pickRandom(options);
    })
    .filter(Boolean);

  const perTagLines = perTagLinesRaw
    .map((line) => fillPlaceholders(line, ctx))
    .filter((r) => !r.hasEmpty)
    .map((r) => r.text);

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

  const remainingText =
    resolvePooledOutput(remainingPool, ctx, fillPlaceholders, {
      count: technicalLineCount - perTagLines.length,
    })?.text ?? '';

  return [perTagLines.join('\n'), remainingText].filter(Boolean).join('\n');
}
