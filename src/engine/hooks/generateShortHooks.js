const DEFAULT_YEARS = 'a few';

function resolveDecade(transformationTags = []) {
  if (transformationTags.includes('00s')) return '2000s';
  if (transformationTags.includes('90s')) return '90s';
  if (transformationTags.includes('80s')) return '80s';

  return 'classic';
}

function resolvePrimaryTag(transformationTags = []) {
  return transformationTags[0] || 'cover';
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function fillHookTemplate(template, formData) {
  const decade = resolveDecade(formData.transformationTags);
  const primaryTag = resolvePrimaryTag(formData.transformationTags);

  const currentYear = new Date().getFullYear();

  return template
    .replaceAll('{artist}', formData.artist || 'This band')
    .replaceAll('{song}', formData.song || 'this song')
    .replaceAll('{signalNumber}', formData.signalNumber || '')
    .replaceAll('{num}', formData.signalNumber || 'XX')
    .replaceAll('{decade}', decade)
    .replaceAll('{year}', formData.originalYear || '')
    .replaceAll('{years}', formData.years || DEFAULT_YEARS)
    .replaceAll('{currentYear}', currentYear)
    .replaceAll('{primaryTag}', primaryTag);
}

function getTagShortHooksForType(type, formData, projectConfig) {
  const selectedTags = formData.transformationTags || [];

  return selectedTags.flatMap((tag) => {
    const tagHooks = projectConfig.tags?.[tag]?.shortHooks?.[type] || [];

    return tagHooks.map((template) =>
      fillHookTemplate(template, formData, projectConfig, { tag }),
    );
  });
}

export function generateShortHooks(formData, projectConfig) {
  const hookTypes = projectConfig.shortHookTypes || {};

  const suffix = projectConfig.title?.shortHookSuffix || '';

  return Object.entries(hookTypes).map(([type, hookConfig]) => {
    const baseHooks = (hookConfig.templates || []).map((template) =>
      fillHookTemplate(template, formData),
    );

    const tagHooks = getTagShortHooksForType(type, formData, projectConfig);

    const hooks = shuffleArray([...baseHooks, ...tagHooks])
      .slice(0, 2)
      .map((hook) => `${hook}${fillHookTemplate(suffix, formData)}`);

    return {
      type,
      label: hookConfig.label || type,
      hooks,
    };
  });
}
