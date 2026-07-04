import { fillPlaceholders, resolveTransformation } from '../placeholders';

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function createBaseHook(template, type, ctx) {
  const { text, hasEmpty } = fillPlaceholders(template, ctx);
  return {
    text,
    hasEmpty,
    sourceText: template,
    sourceType: 'base',
    sourceTag: '',
    hookType: type,
  };
}

function createTagHook(template, type, tag, ctx) {
  const { text, hasEmpty } = fillPlaceholders(template, ctx);
  return {
    text,
    hasEmpty,
    sourceText: template,
    sourceType: 'tag',
    sourceTag: tag,
    hookType: type,
  };
}

function getTagShortHooksForType(type, formData, projectConfig, ctx) {
  const selectedTags = formData.transformationTags || [];

  return selectedTags.flatMap((tag) => {
    const tagHooks = projectConfig.tags?.[tag]?.shortHooks?.[type] || [];

    return tagHooks.map((template) => createTagHook(template, type, tag, ctx));
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
  const transformation = resolveTransformation({ formData, projectConfig });
  const artist = (formData.useCustomArtistShort && formData.artistShort)
    ? formData.artistShort
    : formData.artist || 'This band';

  const ctx = {
    formData,
    projectConfig,
    overrides: {
      artist,
      song: formData.song || 'this song',
      num: formData.signalNumber || 'XX',
      transformation,
    },
  };

  return Object.entries(hookTypes)
    .filter(([, hookConfig]) => {
      if (isFaithful && hookConfig.excludeForFaithful) return false;
      if (hookConfig.requiresGenre && !hasGenre) return false;
      return true;
    })
    .map(([type, hookConfig]) => {
      const baseHooks = (hookConfig.templates || []).map((template) =>
        createBaseHook(template, type, ctx),
      );

      const tagHooks = getTagShortHooksForType(type, formData, projectConfig, ctx);

      const allHooks = [...baseHooks, ...tagHooks];
      const viableHooks = allHooks.filter((hook) => !hook.hasEmpty);
      const hookPool = viableHooks.length > 0 ? viableHooks : allHooks;

      const hooks = shuffleArray(hookPool)
        .slice(0, 2)
        .map((hook) => ({
          ...hook,
          text: `${prefixEnabled ? fillPlaceholders(prefix, ctx).text : ''}${hook.text}${suffixEnabled ? fillPlaceholders(suffix, ctx).text : ''}`,
        }));

      return {
        type,
        label: hookConfig.label || type,
        hooks,
      };
    });
}
