function buildThumbnailVariations(formData, config) {
  const selectedTags = formData.transformationTags || [];

  if (selectedTags.length === 0) {
    return (config.thumbnailWords || []).slice(0, 5);
  }

  const variations = [];
  const thumbnailTagMap = config.thumbnailTagMap || {};

  selectedTags.forEach((tag) => {
    const mappedPhrases = thumbnailTagMap[tag] || [];

    mappedPhrases.forEach((phrase) => {
      if (!variations.includes(phrase) && variations.length < 5) {
        variations.push(phrase);
      }
    });
  });

  const fallbacks = config.thumbnailFallbacks || [];

  fallbacks.forEach((item) => {
    if (!variations.includes(item) && variations.length < 5) {
      variations.push(item);
    }
  });

  return variations.slice(0, 5);
}

export function generateThumbnails(formData, config) {
  const phrases = buildThumbnailVariations(formData, config);

  const artistRaw = formData.artist || 'ARTIST';
  const words = artistRaw.trim().split(' ').filter(Boolean);

  let artistShort = artistRaw;

  if (words.length >= 3) {
    artistShort = words.map((w) => w[0]).join('');
  }

  const artist = artistShort.toUpperCase();
  const song = (formData.song || 'SONG').toUpperCase();

  return phrases.map((phrase) => {
    const text = phrase.toUpperCase();
    if (formData.videoType === 'Shorts') {
      return `${song} // ${text}`;
    }

    return `${artist} // ${text}`;
  });
}
