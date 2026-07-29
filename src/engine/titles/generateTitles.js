import { resolveRecordText } from './resolveTitleRecord';

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

// PICK phase: every random selection lives here — which transformation
// template+phrase wins per slot, which generic templates are viable, which
// hooks get mixed in, and the final shuffled/deduped/sliced order shown.
// Frozen except via Transformation Tags / Regenerate / entry load-clear (see
// useGeneratedOutput.js's narrow-deps memo) — call renderTitles (below)
// against live formData for display.
export function pickTitles(formData = {}, config = {}, shortHooksForTitles = []) {
  const isShorts = formData.videoType === 'Shorts';
  const titleCount = config.title?.count ?? 5;

  const transformations = buildTransformationVariations(formData, config);
  const weightedTemplates = getWeightedTemplates(formData, config);
  const maxPhrases = config.title?.maxTransformationPhrases || 1;
  const connector = config.title?.connector || '&';
  const listSeparator = config.title?.listSeparator ?? ', ';

  const transformationRecords = [];
  if (weightedTemplates.length > 0) {
    const usedTexts = new Set();
    let attempts = 0;

    while (transformationRecords.length < titleCount && attempts < titleCount * 10) {
      const transformation = pickTransformation(transformations, maxPhrases, connector, listSeparator);
      const { template, groupName } = shuffleArray(weightedTemplates)[0];
      const record = { kind: 'transformation', template, groupName, transformation };
      attempts += 1;

      const { text, hasEmpty } = resolveRecordText(record, formData, config);
      if (hasEmpty) continue;
      if (usedTexts.has(text)) continue;
      usedTexts.add(text);
      transformationRecords.push(record);
    }
  }

  const genericTemplates = config.title?.templates?.generic || [];
  const genericRecords = genericTemplates
    .map((template) => {
      const record = { kind: 'generic', template, groupName: 'generic' };
      return { record, ...resolveRecordText(record, formData, config) };
    })
    .filter((r) => !r.hasEmpty)
    .map(({ record }) => record);

  // Hooks only mix into long video titles, not Shorts (Shorts already use
  // hooks directly via the Short Hooks panel). formData.useHooksForLongTitles
  // acts as a per-session override of the project config default. This
  // mixing isn't on the live-refresh path yet — it reuses whatever
  // shortHooksForTitles snapshot the caller passed in.
  const useHooksForLongTitles =
    formData.useHooksForLongTitles ?? config.title?.useHooksForLongTitles ?? false;

  const hookPool = shortHooksForTitles.flatMap((group) => group.hooks || []);
  const hookRecords =
    !useHooksForLongTitles || isShorts
      ? []
      : shuffleArray(hookPool).slice(0, 5).map((hook) => ({ kind: 'hook', hook }));

  // Pool all sources, shuffle, deduplicate by text, then freeze the final
  // order — this is itself a random selection (which titleCount records win
  // and in what order), so it must not re-run on every render.
  const allRecords = [...transformationRecords, ...hookRecords, ...genericRecords];
  const withText = allRecords.map((record) => ({ record, text: resolveRecordText(record, formData, config).text }));
  const seen = new Set();
  const deduped = shuffleArray(withText).filter(({ text }) => {
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });

  return { order: deduped.slice(0, titleCount).map(({ record }) => record) };
}

// RENDER phase: pure placeholder substitution against live formData/config —
// no randomness, safe (and intended) to re-run on every field that feeds a
// placeholder (artist, song, artist-short, signal number).
export function renderTitles(picked, formData = {}, config = {}) {
  return picked.order.map((record) => {
    const { text, sourceHook, sourceTemplate } = resolveRecordText(record, formData, config);
    return { text, sourceHook, sourceTemplate };
  });
}

// Back-compat convenience: pick + render in one call, matching the previous
// single-call signature/shape exactly.
export function generateTitles(formData = {}, config = {}, shortHooksForTitles = []) {
  return renderTitles(pickTitles(formData, config, shortHooksForTitles), formData, config);
}
