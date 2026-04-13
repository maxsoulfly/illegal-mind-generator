function buildTransformationLabel(formData, config, fallbackIndex = 0) {
  const selectedTags = formData.transformationTags || [];

  if (selectedTags.length > 0) {
    return selectedTags
      .slice(0, 3)
      .map((tag) =>
        tag
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
      )
      .join(' + ');
  }

  return config.transformations[fallbackIndex] || 'Heavy Rework';
}

export function generateTitles(formData, config) {
  const template = config.titleTemplates[0];

  return Array.from({ length: 5 }, (_, index) => {
    const transformation = buildTransformationLabel(formData, config, index);

    return template
      .replace('{num}', formData.signalNumber || 'XX')
      .replace('{artist}', formData.artist || 'Artist')
      .replace('{song}', formData.song || 'Song')
      .replace('{transformation}', transformation);
  });
}
