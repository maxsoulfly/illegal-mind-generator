import { resolveTransformation } from '../descriptions/generateCustomBlocks';
import { resolveTagCategoryPlaceholders } from '../descriptions/descriptionTagHelpers';

const DEFAULT_YEARS = 'a few';

function resolveDecade(transformationTags = []) {
  if (transformationTags.includes('00s')) return '2000s';
  if (transformationTags.includes('90s')) return '90s';
  if (transformationTags.includes('80s')) return '80s';

  return 'Classic';
}

function resolvePrimaryTag(transformationTags = [], config = {}) {
  const count = Math.max(1, config.count || 1);
  const order = config.order || 'selection';
  const separator = config.separator ?? ' & ';
  const pool = order === 'random' ? shuffleArray([...transformationTags]) : [...transformationTags];
  return pool.slice(0, count).join(separator) || 'cover';
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function pickOneGenre(str) {
  if (!str) return '';
  const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[Math.floor(Math.random() * parts.length)] || '';
}

function fillHookTemplate(template, formData, transformation = '', primaryTagConfig = {}, projectConfig = {}) {
  const decade = resolveDecade(formData.transformationTags);
  const primaryTag = resolvePrimaryTag(formData.transformationTags, primaryTagConfig);
  const currentYear = new Date().getFullYear();

  const artist = (formData.useCustomArtistShort && formData.artistShort)
    ? formData.artistShort
    : formData.artist || 'This band';
  const filled = template
    .replaceAll('{artist}', artist)
    .replaceAll('{song}', formData.song || 'this song')
    .replaceAll('{signalNumber}', formData.signalNumber || '')
    .replaceAll('{num}', formData.signalNumber || 'XX')
    .replaceAll('{decade}', decade)
    .replaceAll('{year}', formData.originalYear || '')
    .replaceAll('{years}', formData.years || DEFAULT_YEARS)
    .replaceAll('{currentYear}', currentYear)
    .replaceAll('{primaryTag}', primaryTag)
    .replaceAll('{originalGenre}', pickOneGenre(formData.originalGenre))
    .replaceAll('{transformation}', transformation);

  return resolveTagCategoryPlaceholders(filled, formData.transformationTags, projectConfig);
}

function createBaseHook(template, type, formData, transformation, primaryTagConfig, projectConfig) {
  return {
    text: fillHookTemplate(template, formData, transformation, primaryTagConfig, projectConfig),
    sourceText: template,
    sourceType: 'base',
    sourceTag: '',
    hookType: type,
  };
}

function createTagHook(template, type, tag, formData, transformation, primaryTagConfig, projectConfig) {
  return {
    text: fillHookTemplate(template, formData, transformation, primaryTagConfig, projectConfig),
    sourceText: template,
    sourceType: 'tag',
    sourceTag: tag,
    hookType: type,
  };
}

function getTagShortHooksForType(type, formData, projectConfig, transformation, primaryTagConfig) {
  const selectedTags = formData.transformationTags || [];

  return selectedTags.flatMap((tag) => {
    const tagHooks = projectConfig.tags?.[tag]?.shortHooks?.[type] || [];

    return tagHooks.map((template) =>
      createTagHook(template, type, tag, formData, transformation, primaryTagConfig, projectConfig),
    );
  });
}

export function generateShortHooks(formData, projectConfig) {
  const hookTypes = projectConfig.shortHookTypes || {};
  // shortsPrefix/shortsSuffix are the editable UI keys; fall back to legacy shortHookSuffix.
  const prefix = projectConfig.title?.shortsPrefix || '';
  const suffix = projectConfig.title?.shortsSuffix ?? projectConfig.title?.shortHookSuffix ?? '';
  const prefixEnabled = projectConfig.title?.shortsPrefixEnabled !== false;
  const suffixEnabled = projectConfig.title?.shortsSuffixEnabled !== false;

  const isFaithful = (formData.transformationTags || []).includes('faithful');
  const hasGenre = !!(formData.originalGenre?.trim());

  // Resolved once per generation call — stable values for all hook templates.
  const primaryTagConfig = projectConfig.title?.primaryTag || {};
  const transformation = resolveTransformation(formData, projectConfig);

  return Object.entries(hookTypes)
    .filter(([, hookConfig]) => {
      if (isFaithful && hookConfig.excludeForFaithful) return false;
      if (hookConfig.requiresGenre && !hasGenre) return false;
      return true;
    })
    .map(([type, hookConfig]) => {
      const baseHooks = (hookConfig.templates || []).map((template) =>
        createBaseHook(template, type, formData, transformation, primaryTagConfig, projectConfig),
      );

      const tagHooks = getTagShortHooksForType(type, formData, projectConfig, transformation, primaryTagConfig);

      const hooks = shuffleArray([...baseHooks, ...tagHooks])
        .slice(0, 2)
        .map((hook) => ({
          ...hook,
          text: `${prefixEnabled ? fillHookTemplate(prefix, formData, transformation, primaryTagConfig, projectConfig) : ''}${hook.text}${suffixEnabled ? fillHookTemplate(suffix, formData, transformation, primaryTagConfig, projectConfig) : ''}`,
        }));

      return {
        type,
        label: hookConfig.label || type,
        hooks,
      };
    });
}
