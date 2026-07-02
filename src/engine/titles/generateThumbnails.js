// Generate thumbnails
function buildGenericTagThumbnailPhrases(tag, config = {}) {
  const normalizedTag = (tag || '').trim().toUpperCase();

  if (!normalizedTag) {
    return [];
  }

  const templates = config?.thumbnail?.genericTagTemplates || ['{tag}'];

  return templates.map((template) => ({
    phrase: template.replace(/\{tag\}/g, normalizedTag),
    source: { type: 'genericTagTemplates', template },
  }));
}

function shuffleArray(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

// Dedupes a list of { phrase, source } entries by phrase text, keeping the first source seen.
function dedupeByPhrase(entries) {
  const seen = new Set();

  return entries.filter(({ phrase }) => {
    if (seen.has(phrase)) return false;
    seen.add(phrase);
    return true;
  });
}

function buildThumbnailVariations(formData = {}, config = {}) {
  const selectedTags = formData?.transformationTags || [];

  if (selectedTags.length === 0) {
    const words = (config.thumbnail.words || []).map((phrase) => ({
      phrase,
      source: { type: 'words', phrase },
    }));

    return shuffleArray(words).slice(0, 5);
  }

  const tagRegistry = config.tags || {};

  const mappedPool = selectedTags.flatMap((tag) => {
    const specificPhrases = tagRegistry[tag]?.thumbnail || [];

    if (specificPhrases.length > 0) {
      return specificPhrases.map((phrase) => ({
        phrase,
        source: { type: 'tag', tagName: tag, phrase },
      }));
    }

    return buildGenericTagThumbnailPhrases(tag, config);
  });

  const uniqueMapped = dedupeByPhrase(mappedPool);
  const uniqueFallbacks = dedupeByPhrase(
    (config.thumbnail.fallbacks || []).map((phrase) => ({
      phrase,
      source: { type: 'fallbacks', phrase },
    })),
  );

  const shuffledMapped = shuffleArray(uniqueMapped);
  const shuffledFallbacks = shuffleArray(uniqueFallbacks);

  const variations = [];
  const usedPhrases = new Set();

  shuffledMapped.forEach((entry) => {
    if (!usedPhrases.has(entry.phrase) && variations.length < 5) {
      usedPhrases.add(entry.phrase);
      variations.push(entry);
    }
  });

  shuffledFallbacks.forEach((entry) => {
    if (!usedPhrases.has(entry.phrase) && variations.length < 5) {
      usedPhrases.add(entry.phrase);
      variations.push(entry);
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

export function generateThumbnails(formData = {}, config = {}, count = 5) {
  const phraseEntries = buildThumbnailVariations(formData, config);

  if (phraseEntries.length === 0) return [];

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
    ? config.thumbnail?.patterns?.shorts
    : config.thumbnail?.patterns?.long;

  if (!patternPool || patternPool.length === 0) {
    throw new Error('Missing thumbnail patterns in config');
  }

  // Cycle through the phrase pool if more thumbnails are needed than phrases available.
  return Array.from({ length: count }, (_, i) => {
    const { phrase, source } = phraseEntries[i % phraseEntries.length];
    const text = phrase.toUpperCase();
    const pattern = getRandomItem(patternPool);

    let prefix = song;
    if (pattern === 'artistFull') prefix = artistFull;
    else if (pattern === 'artistShort') prefix = artistShortFinal;

    return { text: `${prefix} // ${text}`, source };
  });
}
