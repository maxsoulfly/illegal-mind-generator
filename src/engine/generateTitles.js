function joinTitleWords(words) {
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];
  if (words.length === 2) return `${words[0]} & ${words[1]}`;

  return `${words.slice(0, -1).join(', ')} & ${words[words.length - 1]}`;
}

function buildTransformationVariations(formData, config) {
  const selectedTags = formData.transformationTags || [];

  if (selectedTags.length === 0) {
    return (config.transformations || []).slice(0, 5);
  }

  const titleTagMap = config.titleTagMap || {};
  const mappedWords = selectedTags.map((tag) => {
    const options = titleTagMap[tag] || [tag];
    return options[0];
  });

  const suffixes = config.titleVariationSuffixes || [];
  const joined = joinTitleWords(mappedWords);
  const firstTwo = joinTitleWords(mappedWords.slice(0, 2)) || joined;
  const lastWord = mappedWords[mappedWords.length - 1] || joined;

  const variations = [
    joined,
    suffixes[0] ? `${joined} ${suffixes[0]}` : `${joined} Version`,
    suffixes[1] ? `${firstTwo} ${suffixes[1]}` : `${firstTwo} Rework`,
    suffixes[3] ? `${lastWord} ${suffixes[3]}` : `${lastWord} Reconstruction`,
    suffixes[2] ? `${joined} ${suffixes[2]}` : `${joined} Mix`,
  ];

  return variations.slice(0, 5);
}

export function generateTitles(formData, config) {
  const template = config.titleTemplates[0];
  const variations = buildTransformationVariations(formData, config);

  return variations.map((transformation) => {
    return template
      .replace('{num}', formData.signalNumber || 'XX')
      .replace('{artist}', formData.artist || 'Artist')
      .replace('{song}', formData.song || 'Song')
      .replace('{transformation}', transformation);
  });
}
