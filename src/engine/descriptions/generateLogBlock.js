import { getEffectiveSongOverrides, renderTextTemplate, resolveHookOverride } from './generateCustomBlocks';

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function generateLogBlock(
  selectedTags,
  projectConfig,
  formData,
  tagLine,
) {
  const tagRegistry = projectConfig?.tags || {};

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  const logLines = selectedTags
    .map((tag) => {
      const options = getDescriptionTag(tag).log || [];

      return pickRandom(options);
    })
    .filter(Boolean);

  const shuffledLogs = logLines.sort(() => 0.5 - Math.random());

  const tagLogBlock = shuffledLogs.slice(0, 1).join('\n');

  const logTemplate = pickRandom(
    projectConfig?.description.templates?.long?.logBlock,
  );

  const logNotes = projectConfig?.description.templates?.long?.logNotes || [];

  const defaultLogNote =
    logNotes.length > 0
      ? pickRandom(logNotes)
      : projectConfig?.description.templates?.long?.defaultLogNote ||
        'Signal stabilized.';

  const songOverrides = getEffectiveSongOverrides(formData);
  const logOverride = resolveHookOverride(songOverrides.logBlock);
  const logNote = renderTextTemplate(
    logOverride || defaultLogNote,
    projectConfig,
    formData,
    tagLine,
  );

  const baseLogBlock = logTemplate
    .replace(/\{tagLine\}/g, tagLine)
    .replace(/\{logNote\}/g, logNote);

  return [baseLogBlock, tagLogBlock].filter(Boolean).join('\n');
}
