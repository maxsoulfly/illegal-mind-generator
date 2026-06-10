// Picks up to maxPhrases unique phrases and joins them list-style:
// 1 phrase  → "Heavier"
// 2 phrases → "Heavier & Darker"
// 3+ phrases → "Heavier, Darker & Alt Metal"
function pickTransformation(phrasePool, maxPhrases, connector, listSeparator) {
  const count = Math.min(maxPhrases, phrasePool.length);
  const picked = shuffleArray(phrasePool).slice(0, count);
  if (picked.length === 0) return 'Rework';
  if (picked.length === 1) return picked[0];
  if (picked.length === 2) return `${picked[0]} ${connector} ${picked[1]}`;
  const allButLast = picked.slice(0, -1).join(listSeparator);
  return `${allButLast} ${connector} ${picked[picked.length - 1]}`;
}

function buildTransformationVariations(formData = {}, config = {}) {
  const selectedTags = formData?.transformationTags || [];

  if (selectedTags.length === 0) {
    return ['Rework'];
  }

  if (selectedTags.includes('faithful')) {
    const faithfulPhrases = config.tags?.faithful?.title ||
      config.title?.faithfulPhrases || ['Faithful'];

    return shuffleArray(faithfulPhrases);
  }

  const phrasePool = selectedTags.flatMap((tag) => {
    return config.tags?.[tag]?.title || [];
  });

  const uniquePhrases = [...new Set(phrasePool)].filter(Boolean);

  if (uniquePhrases.length === 0) {
    return ['Rework'];
  }

  return shuffleArray(uniquePhrases);
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
    return words
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  return artistRaw;
}

function getTitleTemplateGroups(config = {}) {
  const templates = config.title?.templates || [];

  if (Array.isArray(templates)) {
    return {
      standardTemplates: templates,
      butItsTemplates: [],
    };
  }

  return {
    standardTemplates: templates.standard || [],
    butItsTemplates: templates.butIts || [],
  };
}

function getWeightedTemplates(formData = {}, config = {}) {
  const selectedTags = formData.transformationTags || [];
  const excludedButItsTags = config.title?.butItsExcludedTags || [];

  const hasButItsExcludedTag = selectedTags.some((tag) =>
    excludedButItsTags.includes(tag),
  );

  const { standardTemplates, butItsTemplates } = getTitleTemplateGroups(config);

  const baseTemplates = hasButItsExcludedTag
    ? standardTemplates
    : [...standardTemplates, ...butItsTemplates];

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
  const weightedTemplates = getWeightedTemplates(formData, config);

  if (weightedTemplates.length === 0) {
    return [];
  }

  const artistFull = formData.artist || '[Artist Name]';
  const generatedArtistShort = buildGeneratedArtistShort(artistFull);
  const artistShortFinal =
    formData.useCustomArtistShort && formData.artistShort
      ? formData.artistShort
      : generatedArtistShort;

  const isShorts = formData.videoType === 'Shorts';
  const num = formData.signalNumber || 'XX';

  const prefixEnabled = config.title?.prefixEnabled !== false;
  const longSuffixEnabled = config.title?.longSuffixEnabled !== false;
  const shortsPrefixEnabled = config.title?.shortsPrefixEnabled !== false;
  const shortsSuffixEnabled = config.title?.shortsSuffixEnabled !== false;

  // Support both 'prefix' and legacy 'longPrefix' key names.
  const longPrefixRaw = config.title?.prefix || config.title?.longPrefix || '';
  const longSuffixRaw = config.title?.longSuffix || '';
  const shortsPrefixRaw = config.title?.shortsPrefix || '';
  const shortsSuffixRaw = config.title?.shortsSuffix || '';

  const longPrefix = prefixEnabled ? longPrefixRaw.replace('{num}', num) : '';
  const longSuffix = longSuffixEnabled ? longSuffixRaw.replace('{num}', num) : '';
  const shortsPrefix = shortsPrefixEnabled ? shortsPrefixRaw.replace('{num}', num) : '';
  const shortsSuffix = shortsSuffixEnabled ? shortsSuffixRaw.replace('{num}', num) : '';

  const maxPhrases = config.title?.maxTransformationPhrases || 1;
  const connector = config.title?.connector || '&';
  const listSeparator = config.title?.listSeparator ?? ', ';

  const titles = [];
  const usedTitles = new Set();
  let attempts = 0;

  while (titles.length < 5 && attempts < 50) {
    const transformation = pickTransformation(transformations, maxPhrases, connector, listSeparator);
    const randomTemplates = shuffleArray(weightedTemplates);
    const template = randomTemplates[0];

    const baseTitle = fillTemplate(template, {
      signalNumber: formData.signalNumber || 'XX',
      artist: isShorts ? artistShortFinal : artistFull,
      song: formData.song || '[Song Name]',
      transformation,
    });

    const title = isShorts
      ? `${shortsPrefix}${baseTitle}${shortsSuffix}`
      : `${longPrefix}${baseTitle}${longSuffix}`;

    if (!usedTitles.has(title)) {
      usedTitles.add(title);
      titles.push(title);
    }

    attempts += 1;
  }

  return titles;
}
