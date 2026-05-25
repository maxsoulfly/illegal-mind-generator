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

function fillHookTemplate(template, formData) {
  const decade = resolveDecade(formData.transformationTags);
  const primaryTag = resolvePrimaryTag(formData.transformationTags);

  return template
    .replaceAll('{artist}', formData.artist || 'This band')
    .replaceAll('{song}', formData.song || 'this song')
    .replaceAll('{signalNumber}', formData.signalNumber || '')
    .replaceAll('{num}', formData.signalNumber || 'XX')
    .replaceAll('{decade}', decade)
    .replaceAll('{year}', formData.originalYear || '')
    .replaceAll('{years}', formData.years || DEFAULT_YEARS)
    .replaceAll('{primaryTag}', primaryTag);
}

export function generateShortHooks(formData, projectConfig) {
  const hookTypes = projectConfig.shortHookTypes || {};

  const suffix = projectConfig.title?.shortHookSuffix || '';

  return Object.entries(hookTypes).map(([type, hookConfig]) => ({
    type,
    label: hookConfig.label || type,
    hooks: (hookConfig.templates || []).map((template) => {
      const hook = fillHookTemplate(template, formData);

      return `${hook}${fillHookTemplate(suffix, formData)}`;
    }),
  }));
}
