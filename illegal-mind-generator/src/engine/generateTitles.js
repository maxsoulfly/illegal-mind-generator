function toTitleCase(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildTransformationVariations(formData, config) {
  const selectedTags = (formData.transformationTags || []).map(toTitleCase);

  if (selectedTags.length === 0) {
    return config.transformations.slice(0, 5);
  }

  const suffixes = config.titleVariationSuffixes || [];
  const joined = selectedTags.join(' + ');
  const firstTwo = selectedTags.slice(0, 2).join(' + ') || joined;
  const lastTag = selectedTags[selectedTags.length - 1] || joined;

  const variations = [
    joined,
    suffixes[0] ? `${joined} ${suffixes[0]}` : `${joined} Version`,
    suffixes[1] ? `${firstTwo} ${suffixes[1]}` : `${firstTwo} Rework`,
    suffixes[3] ? `${lastTag} ${suffixes[3]}` : `${lastTag} Reconstruction`,
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
