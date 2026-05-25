function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function generateTechnicalBlock(selectedTags, projectConfig) {
  const tagRegistry = projectConfig?.tags || {};

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  // Step 1: pick one line per tag
  const perTagLines = selectedTags
    .map((tag) => {
      const options = getDescriptionTag(tag).technical || [];

      return pickRandom(options);
    })
    .filter(Boolean);

  // Step 2: if less than 3, fill from all available
  const allLines = selectedTags.flatMap(
    (tag) => getDescriptionTag(tag).technical || [],
  );

  const remaining = allLines
    .filter((line) => !perTagLines.includes(line))
    .sort(() => 0.5 - Math.random());

  const finalLines = [...perTagLines, ...remaining].slice(0, 3);

  return finalLines.join('\n');
}
