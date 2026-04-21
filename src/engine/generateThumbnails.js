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

function buildGeneratedArtistShort(artistRaw) {
  const words = artistRaw.trim().split(' ').filter(Boolean);

  if (words.length >= 3) {
    return words.map((word) => word[0]).join('');
  }

  return artistRaw;
}

export function generateThumbnails(formData, config) {
  const phrases = buildThumbnailVariations(formData, config);

  const artistFull = (formData.artist || 'ARTIST').toUpperCase();
  const generatedArtistShort = buildGeneratedArtistShort(
    formData.artist || 'ARTIST',
  ).toUpperCase();

  const artistShortFinal =
    formData.useCustomArtistShort && formData.artistShort
      ? formData.artistShort.toUpperCase()
      : generatedArtistShort;

  const song = (formData.song || 'SONG').toUpperCase();

  return phrases.map((phrase, index) => {
    const text = phrase.toUpperCase();

    if (formData.videoType === 'Shorts') {
      // alternate between artist short and song
      return index % 2 === 0
        ? `${artistShortFinal} // ${text}`
        : `${song} // ${text}`;
    }

    return `${artistFull} // ${text}`;
  });
}
