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

  const joined = selectedTags.join(' + ');
  const firstTwo = selectedTags.slice(0, 2).join(' + ');
  const lastTag = selectedTags[selectedTags.length - 1];

  const variations = [
    joined,
    `${joined} Version`,
    `${firstTwo || joined} Rework`,
    `${lastTag} Reconstruction`,
    `${joined} Mix`,
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
