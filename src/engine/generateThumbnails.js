function buildGenericTagThumbnailPhrases(tag) {
  const normalizedTag = (tag || '').trim().toUpperCase();

  if (!normalizedTag) {
    return [];
  }

  return [
    normalizedTag,
    `${normalizedTag} MODE`,
    `${normalizedTag} VERSION`,
    `${normalizedTag} EDGE`,
    `MORE ${normalizedTag}`,
  ];
}

function shuffleArray(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildThumbnailVariations(formData, config) {
  const selectedTags = formData.transformationTags || [];

  if (selectedTags.length === 0) {
    return shuffleArray(config.thumbnailWords || []).slice(0, 5);
  }

  const thumbnailTagMap = config.thumbnailTagMap || {};

  const mappedPool = selectedTags.flatMap((tag) => {
    const specificPhrases = thumbnailTagMap[tag] || [];
    const genericPhrases = buildGenericTagThumbnailPhrases(tag);

    return [...specificPhrases, ...genericPhrases];
  });

  const uniqueMapped = [...new Set(mappedPool)];
  const uniqueFallbacks = [...new Set(config.thumbnailFallbacks || [])];

  const shuffledMapped = shuffleArray(uniqueMapped);
  const shuffledFallbacks = shuffleArray(uniqueFallbacks);

  const variations = [];

  shuffledMapped.forEach((phrase) => {
    if (!variations.includes(phrase) && variations.length < 5) {
      variations.push(phrase);
    }
  });

  shuffledFallbacks.forEach((phrase) => {
    if (!variations.includes(phrase) && variations.length < 5) {
      variations.push(phrase);
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

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
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
  const isShorts = formData.videoType === 'Shorts';

  const patternPool = isShorts
    ? ['artistShort', 'song']
    : ['artistFull', 'artistShort', 'song'];

  return phrases.map((phrase) => {
    const text = phrase.toUpperCase();
    const pattern = getRandomItem(patternPool);

    if (pattern === 'artistFull') {
      return `${artistFull} // ${text}`;
    }

    if (pattern === 'artistShort') {
      return `${artistShortFinal} // ${text}`;
    }

    return `${song} // ${text}`;
  });
}
