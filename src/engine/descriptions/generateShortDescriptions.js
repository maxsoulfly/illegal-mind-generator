import { renderStructuredBlock, renderCustomBlock, getEffectiveSongOverrides, resolveHookBlockTemplates, renderTextTemplate, resolveHookOverride } from './generateCustomBlocks';
import { isListBlock } from '../../utils/customBlocks';

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function generateShortDescriptions(
  formData,
  projectConfig,
  shortHooks = [],
  tagPhrase = '',
) {
  const shortsConfig = projectConfig.description.templates.shorts;
  const count = shortsConfig.count || 3;
  const coverLabel = shortsConfig.coverLabel || '';

  const shortsLayout = shortsConfig.layout || [
    'coverLine',
    'hook',
    'secondary',
  ];

  // List blocks live under templates.long.customBlocks regardless of which
  // description(s) they target — target decides eligibility, not location.
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const songOverrides = getEffectiveSongOverrides(formData);

  // shortHooks is an array of groups, each with a `hooks` array of hook objects.
  // We only need the text string from each hook object for use in descriptions.
  const hookTextPool = shortHooks.flatMap((hookGroup) => {
    const hooksInGroup = hookGroup.hooks || [];
    return hooksInGroup.map((hook) => hook.text || '');
  });

  function renderShortLine(blockName) {
    if (blockName === 'coverLine') {
      const headerTemplates = shortsConfig.header || [];
      const template = pickRandom(headerTemplates) || '{artist} - {song}';
      return renderTextTemplate(template, projectConfig, formData, tagPhrase)
        .replace(/\{coverLabel\}/g, coverLabel)
        .replace(/\{num\}/g, formData.signalNumber || '00');
    }

    if (blockName === 'hook') {
      return pickRandom(hookTextPool);
    }

    if (isListBlock(customBlocks[blockName])) {
      const rendered = renderStructuredBlock(customBlocks[blockName], projectConfig.description.links);
      // Pad list blocks with blank lines so they stand apart from the
      // single-newline-joined surrounding lines.
      return rendered ? `\n${rendered}\n` : '';
    }

    if (blockName in customBlocks) {
      return renderCustomBlock(
        customBlocks[blockName],
        projectConfig,
        formData,
        tagPhrase,
        songOverrides[blockName]?.trim(),
      );
    }

    const hookSongOverride = resolveHookOverride(songOverrides[blockName]);
    if (hookSongOverride) return renderTextTemplate(hookSongOverride, projectConfig, formData, tagPhrase);

    const hookTemplates = resolveHookBlockTemplates(blockName, projectConfig);
    const options = hookTemplates ?? shortsConfig[blockName] ?? [];
    const template = pickRandom(options);

    // renderTextTemplate handles {artist}/{song}/{year}/{originalGenre}/{tagLine}/{transformation}/{links.*}.
    // {num} and {coverLabel} are shorts-specific so are applied after.
    return renderTextTemplate(template, projectConfig, formData, tagPhrase)
      .replace(/\{num\}/g, formData.signalNumber || '00')
      .replace(/\{coverLabel\}/g, coverLabel);
  }

  const shortDescriptions = [];

  for (let i = 0; i < count; i++) {
    const text = shortsLayout.map(renderShortLine).filter(Boolean).join('\n');
    shortDescriptions.push(text);
  }

  return shortDescriptions;
}
