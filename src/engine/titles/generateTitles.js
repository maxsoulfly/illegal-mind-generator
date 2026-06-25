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

// Returns weighted template entries as { template, groupName } so callers
// can track which group (standard / butIts) each template came from.
function getWeightedTemplates(formData = {}, config = {}) {
  const selectedTags = formData.transformationTags || [];
  const excludedButItsTags = config.title?.butItsExcludedTags || [];

  const hasButItsExcludedTag = selectedTags.some((tag) =>
    excludedButItsTags.includes(tag),
  );

  const { standardTemplates, butItsTemplates } = getTitleTemplateGroups(config);

  const taggedTemplates = [
    ...standardTemplates.map((template) => ({ template, groupName: 'standard' })),
    ...(hasButItsExcludedTag ? [] : butItsTemplates.map((template) => ({ template, groupName: 'butIts' }))),
  ];

  return taggedTemplates.flatMap(({ template, groupName }) => {
    const hasArtist = template.includes('{artist}');
    const hasSong = template.includes('{song}');
    const hasTransformation = template.includes('{transformation}');

    const isArtistSongTransformation = hasArtist && hasSong && hasTransformation;
    const isSongTransformation = !hasArtist && hasSong && hasTransformation;
    const isArtistTransformation = hasArtist && !hasSong && hasTransformation;

    if (isSongTransformation || isArtistTransformation) {
      return [{ template, groupName }, { template, groupName }, { template, groupName }];
    }

    if (isArtistSongTransformation) {
      return [{ template, groupName }];
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

// Builds the pool of transformation-based titles (same logic as before).
// Each entry is { text, sourceHook: null } — sourceHook is null because
// these come from tag phrases, not short hook templates.
function buildTransformationTitles(formData, config, isShorts, artistFull, artistShortFinal, longPrefix, longSuffix, shortsPrefix, shortsSuffix) {
  const transformations = buildTransformationVariations(formData, config);
  const weightedTemplates = getWeightedTemplates(formData, config);

  if (weightedTemplates.length === 0) return [];

  const maxPhrases = config.title?.maxTransformationPhrases || 1;
  const connector = config.title?.connector || '&';
  const listSeparator = config.title?.listSeparator ?? ', ';

  const titleCount = config.title?.count ?? 5;
  const results = [];
  const usedTexts = new Set();
  let attempts = 0;

  while (results.length < titleCount && attempts < titleCount * 10) {
    const transformation = pickTransformation(transformations, maxPhrases, connector, listSeparator);
    const { template, groupName } = shuffleArray(weightedTemplates)[0];

    const baseTitle = fillTemplate(template, {
      signalNumber: formData.signalNumber || 'XX',
      artist: isShorts ? artistShortFinal : artistFull,
      song: formData.song || '[Song Name]',
      transformation,
    });

    const text = isShorts
      ? `${shortsPrefix}${baseTitle}${shortsSuffix}`
      : `${longPrefix}${baseTitle}${longSuffix}`;

    if (!usedTexts.has(text)) {
      usedTexts.add(text);
      // sourceTemplate tracks which template and group produced this title
      // so the UI can navigate back to Project Settings → Titles.
      results.push({ text, sourceHook: null, sourceTemplate: { template, groupName } });
    }

    attempts += 1;
  }

  return results;
}

function buildGenericTitles(formData, config, isShorts, artistFull, artistShortFinal, longPrefix, longSuffix, shortsPrefix, shortsSuffix) {
  const genericTemplates = config.title?.templates?.generic || [];
  if (genericTemplates.length === 0) return [];

  return shuffleArray(genericTemplates).map((template) => {
    const baseTitle = template
      .replace('{num}',    formData.signalNumber || 'XX')
      .replace('{artist}', isShorts ? artistShortFinal : artistFull)
      .replace('{song}',   formData.song         || '[Song Name]')
      .replace('{year}',   formData.originalYear || '');

    const text = isShorts
      ? `${shortsPrefix}${baseTitle}${shortsSuffix}`
      : `${longPrefix}${baseTitle}${longSuffix}`;

    return { text, sourceHook: null, sourceTemplate: { template, groupName: 'generic' } };
  });
}

// Builds hook-based titles by pulling from the short hook pool and applying
// the long title prefix/suffix. Each entry carries sourceHook metadata so
// the UI can show a navigation link back to where the hook came from.
function buildHookTitles(shortHooks, longPrefix, longSuffix) {
  const hookPool = shortHooks.flatMap((group) => group.hooks || []);

  if (hookPool.length === 0) return [];

  return shuffleArray(hookPool)
    .slice(0, 5)
    .map((hook) => ({
      text: `${longPrefix}${hook.text}${longSuffix}`,
      sourceHook: {
        sourceType: hook.sourceType,
        sourceTag: hook.sourceTag,
        hookType: hook.hookType,
        sourceText: hook.sourceText,
      },
      sourceTemplate: null,
    }));
}

export function generateTitles(formData = {}, config = {}, shortHooks = []) {
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

  const transformationTitles = buildTransformationTitles(
    formData, config, isShorts,
    artistFull, artistShortFinal,
    longPrefix, longSuffix, shortsPrefix, shortsSuffix,
  );

  // Hooks only mix into long video titles, not Shorts (Shorts already use
  // hooks directly via the Short Hooks panel).
  // formData.useHooksForLongTitles acts as a per-session override of the
  // project config default.
  const useHooksForLongTitles =
    formData.useHooksForLongTitles ?? config.title?.useHooksForLongTitles ?? false;

  const titleCount = config.title?.count ?? 5;

  const genericTitles = buildGenericTitles(
    formData, config, isShorts,
    artistFull, artistShortFinal,
    longPrefix, longSuffix, shortsPrefix, shortsSuffix,
  );

  const hookTitles =
    !useHooksForLongTitles || isShorts
      ? []
      : buildHookTitles(shortHooks, longPrefix, longSuffix);

  // Pool all sources, shuffle, deduplicate by text, then slice to titleCount.
  const pool = shuffleArray([...transformationTitles, ...hookTitles, ...genericTitles]);
  const seen = new Set();
  const deduped = pool.filter(({ text }) => {
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });
  return deduped.slice(0, titleCount);
}
