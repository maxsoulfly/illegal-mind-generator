function toTitleCase(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildThumbnailVariations(formData, config) {
  const selectedTags = (formData.transformationTags || []).map(toTitleCase);

  if (selectedTags.length === 0) {
    return config.thumbnailWords.slice(0, 5);
  }

  const hasSlower = selectedTags.includes('Slower');
  const hasHeavier = selectedTags.includes('Heavier');
  const hasDarker = selectedTags.includes('Darker');
  const hasAltMetal = selectedTags.includes('Alt Metal');
  const hasPunk = selectedTags.includes('Punk');
  const hasHardcore = selectedTags.includes('Hardcore');
  const hasModernized = selectedTags.includes('Modernized');

  const variations = [];

  if (hasSlower && hasHeavier) {
    variations.push('SLOWER & HEAVIER');
    variations.push('HEAVIER VERSION');
  }

  if (hasDarker) {
    variations.push('DARKER NOW');
  }

  if (hasAltMetal) {
    variations.push('ALT METAL');
  }

  if (hasPunk) {
    variations.push('PUNK REWORK');
  }

  if (hasHardcore) {
    variations.push('HARDCORE EDGE');
  }

  if (hasModernized) {
    variations.push('MODERNIZED');
  }

  if (variations.length < 5) {
    const fallbacks = [
      'NEW VERSION',
      'HEAVY REWORK',
      'REBUILT',
      'MORE IMPACT',
      'DARKER FEEL',
    ];

    fallbacks.forEach((item) => {
      if (variations.length < 5 && !variations.includes(item)) {
        variations.push(item);
      }
    });
  }

  return variations.slice(0, 5);
}

export function generateThumbnails(formData, config) {
  return buildThumbnailVariations(formData, config);
}
