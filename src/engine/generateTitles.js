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

function getWeightedTemplates(formData, config) {
  const isShorts = formData.videoType === 'Shorts';
  const baseTemplates =
    isShorts && config.shortTitleTemplates?.length
      ? config.shortTitleTemplates
      : config.titleTemplates || [];

  if (!isShorts) {
    return baseTemplates;
  }

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

export function generateTitles(formData, config) {
  const transformations = buildTransformationVariations(formData, config);
  const weightedTemplates = getWeightedTemplates(formData, config);

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
    const transformation =
      transformations[attempts % transformations.length] || 'Rework';
    const randomTemplates = shuffleArray(weightedTemplates);
    const template = randomTemplates[0];

    const title = fillTemplate(template, {
      signalNumber: formData.signalNumber || 'XX',
      artist: isShorts ? artistShortFinal : artistFull,
      song: formData.song || 'Song',
      transformation,
    });

    if (!usedTitles.has(title)) {
      usedTitles.add(title);
      titles.push(title);
    }

    attempts += 1;
  }

  return titles;
}
