import { fillPlaceholders, resolveTransformation } from '../placeholders';
import { pickRandomLines } from '../pooling';

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

      // Hooks whose placeholders would render empty (e.g. {tags.genre} with no
      // genre-category tag selected) are dropped rather than shown half-filled.
      const hookPool = [...baseHooks, ...tagHooks].filter((hook) => !hook.hasEmpty);

      // rawText keeps the unwrapped hook text around — this same array is also
      // reused by generateTitles.js to mix hooks into Long titles, which needs
      // the Long prefix/suffix instead of the Shorts one baked into `text`.
      const hooks = pickRandomLines(hookPool, 2)
        .map((hook) => ({
          ...hook,
          rawText: hook.text,
          text: `${prefixEnabled ? fillPlaceholders(prefix, ctx).text : ''}${hook.text}${suffixEnabled ? fillPlaceholders(suffix, ctx).text : ''}`,
        }));

      return {
        type,
        label: hookConfig.label || type,
        hooks,
      };
    });
}
