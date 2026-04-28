function getRandomItem(items) {
  if (!items || items.length === 0) {
    return '';
  }

  return items[Math.floor(Math.random() * items.length)];
}

function buildShortTransformationPhrase(tags = [], config = {}) {
  if (tags.length === 0) {
    return 'Rework';
  }

  const titleTagMap = config.titleTagMap || {};

  const pickedWords = tags
    .map((tag) => {
      const options = titleTagMap[tag] || [tag];
      return getRandomItem(options) || tag;
    })
    .filter(Boolean);

  const limitedWords = shuffleArray(pickedWords).slice(0, 1);

  if (limitedWords.length === 0) {
    return 'Rework';
  }

  return limitedWords[0];
}

function buildTransformationVariations(formData = {}, config = {}) {
  const selectedTags = formData?.transformationTags || [];

  if (selectedTags.length === 0) {
    return ['Rework'];
  }

  return [buildShortTransformationPhrase(selectedTags, config)];
}

function shuffleArray(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildGeneratedArtistShort(artistRaw) {
  const words = artistRaw.trim().split(' ').filter(Boolean);

  if (words.length >= 3) {
    return words.map((word) => word[0]).join('');
  }

  return artistRaw;
}

function getWeightedTemplates(config = {}) {
  const baseTemplates = config.shortTitleTemplates || [];

  return baseTemplates.flatMap((template) => {
    const hasArtist = template.includes('{artist}');
    const hasSong = template.includes('{song}');
    const hasTransformation = template.includes('{transformation}');

    const isArtistSongTransformation =
      hasArtist && hasSong && hasTransformation;
    const isSongTransformation = !hasArtist && hasSong && hasTransformation;
    const isArtistTransformation = hasArtist && !hasSong && hasTransformation;

    if (isSongTransformation || isArtistTransformation) {
      return [template, template, template];
    }

    if (isArtistSongTransformation) {
      return [template];
    }

    return [];
  });
}

function fillTemplate(template, values) {
  return template
    .replace('{num}', values.signalNumber || 'XX')
    .replace('{artist}', values.artist)
    .replace('{song}', values.song)
    .replace('{transformation}', values.transformation);
}

export function generateTitles(formData = {}, config = {}) {
  const transformations = buildTransformationVariations(formData, config);
  const weightedTemplates = getWeightedTemplates(config);

  if (weightedTemplates.length === 0) {
    return [];
  }

  const artistFull = formData.artist || 'Artist';
  const generatedArtistShort = buildGeneratedArtistShort(artistFull);
  const artistShortFinal =
    formData.useCustomArtistShort && formData.artistShort
      ? formData.artistShort
      : generatedArtistShort;

  const isShorts = formData.videoType === 'Shorts';

  const titles = [];
  const usedTitles = new Set();
  let attempts = 0;

  while (titles.length < 5 && attempts < 50) {
    const transformation = transformations[attempts % transformations.length];
    const randomTemplates = shuffleArray(weightedTemplates);
    const template = randomTemplates[0];

    const baseTitle = fillTemplate(template, {
      signalNumber: formData.signalNumber || 'XX',
      artist: isShorts ? artistShortFinal : artistFull,
      song: formData.song || 'Song',
      transformation,
    });

    const title = isShorts
      ? `[SIGNAL ${formData.signalNumber || 'XX'}] // ${baseTitle}`
      : `[SIGNAL ${formData.signalNumber || 'XX'}] // ${baseTitle} // Illegal Mind Rework`;

    if (!usedTitles.has(title)) {
      usedTitles.add(title);
      titles.push(title);
    }

    attempts += 1;
  }

  return titles;
}
