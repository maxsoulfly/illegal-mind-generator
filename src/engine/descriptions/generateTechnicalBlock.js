function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function generateTechnicalBlock(selectedTags, projectConfig) {
  const tagRegistry = projectConfig?.tags || {};
  const baseLines = projectConfig?.description?.templates?.long?.technicalLines || [];

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  // Step 1: pick one line per tag
  const perTagLines = selectedTags
    .map((tag) => {
      const options = getDescriptionTag(tag).technical || [];
      return pickRandom(options);
    })
    .filter(Boolean);

  // Step 2: fill remaining slots from all tag lines, then base defaults
  const allTagLines = selectedTags.flatMap(
    (tag) => getDescriptionTag(tag).technical || [],
  );

  const remaining = [...allTagLines, ...baseLines]
    .filter((line) => !perTagLines.includes(line))
    .sort(() => 0.5 - Math.random());

  const technicalLineCount =
    projectConfig?.description?.hookBlockCounts?.technicalLines ??
    projectConfig?.description?.technicalLineCount ??
    3;

  const finalLines = [...perTagLines, ...remaining].slice(0, technicalLineCount);

  return finalLines.join('\n');
}
