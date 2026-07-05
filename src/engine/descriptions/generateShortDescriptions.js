import { renderStructuredBlock, renderCustomBlock, getEffectiveSongOverrides, resolveHookBlockOutput, renderTextTemplate, resolveHookOverride, pickViableTemplate } from './generateCustomBlocks';
import { isListBlock } from '../../utils/customBlocks';
import { buildHookBlockMaps } from '../../utils/descriptionLayout';

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)];
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
  const ctx = { formData, projectConfig, tagLine: tagPhrase };

  const shortsLayout = shortsConfig.layout || [
    'coverLine',
    'hook',
    'secondary',
  ];

  // List blocks live under templates.long.customBlocks regardless of which
  // description(s) they target — target decides eligibility, not location.
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const songOverrides = getEffectiveSongOverrides(formData);
  const { layoutKeyToBlockKey } = buildHookBlockMaps(projectConfig.description?.hookBlocks || []);

  // shortHooks is an array of groups, each with a `hooks` array of hook objects
  // ({ text, sourceType, sourceTag, hookType, sourceText }) — kept whole (not
  // reduced to .text) so a picked hook's source can drive click-to-navigate.
  const hookPool = shortHooks.flatMap((hookGroup) => hookGroup.hooks || []);

  function renderShortLine(blockName) {
    if (blockName === 'coverLine') {
      const headerTemplates = shortsConfig.header || [];
      const picked = pickViableTemplate(headerTemplates, ctx);
      const text = picked?.text ?? renderTextTemplate('{artist} - {song}', projectConfig, formData, tagPhrase);
      const filledText = text
        .replace(/\{coverLabel\}/g, coverLabel)
        .replace(/\{num\}/g, formData.signalNumber || '00');
      const blockKey = layoutKeyToBlockKey['coverLine'];
      return {
        text: filledText,
        source: picked && blockKey ? { type: 'block', blockKey, blockType: 'hook' } : undefined,
      };
    }

    if (blockName === 'hook') {
      const hook = pickRandom(hookPool);
      return { text: hook?.text || '', source: hook };
    }

    if (isListBlock(customBlocks[blockName])) {
      const rendered = renderStructuredBlock(customBlocks[blockName], projectConfig.description.links);
      // Pad list blocks with blank lines so they stand apart from the
      // single-newline-joined surrounding lines.
      return {
        text: rendered ? `\n${rendered}\n` : '',
        source: rendered ? { type: 'block', blockKey: blockName, blockType: 'list' } : undefined,
      };
    }

    if (blockName in customBlocks) {
      const text = renderCustomBlock(
        customBlocks[blockName],
        projectConfig,
        formData,
        tagPhrase,
        songOverrides[blockName]?.trim(),
      );
      return {
        text,
        source: text ? { type: 'block', blockKey: blockName, blockType: 'text' } : undefined,
      };
    }

    const hookSongOverride = resolveHookOverride(songOverrides[blockName]);
    if (hookSongOverride) {
      const text = renderTextTemplate(hookSongOverride, projectConfig, formData, tagPhrase);
      const blockKey = layoutKeyToBlockKey[blockName] ?? blockName;
      return { text, source: text ? { type: 'block', blockKey, blockType: 'hook' } : undefined };
    }

    // resolveHookBlockOutput already resolves+fills placeholders (filtering out
    // empty-value candidates first); the legacy shortsConfig fallback needs its
    // own fill pass. {num}/{coverLabel} are shorts-specific, applied after either way.
    const hookBlockText = resolveHookBlockOutput(blockName, ctx);
    const text =
      hookBlockText ??
      pickViableTemplate(shortsConfig[blockName] ?? [], ctx)?.text ??
      '';

    const filledText = text
      .replace(/\{num\}/g, formData.signalNumber || '00')
      .replace(/\{coverLabel\}/g, coverLabel);

    // Only the generic hook-block path has a real editor to point to — the
    // legacy shortsConfig[blockName] fallback predates the Hook Blocks system
    // and has no dedicated block editor, so it stays unnavigable (no source).
    const blockKey = layoutKeyToBlockKey[blockName] ?? blockName;
    return {
      text: filledText,
      source: hookBlockText ? { type: 'block', blockKey, blockType: 'hook' } : undefined,
    };
  }

  const shortDescriptions = [];
  const shortDescriptionSegments = [];

  for (let i = 0; i < count; i++) {
    const segments = shortsLayout.map(renderShortLine).filter((s) => s.text);
    shortDescriptions.push(segments.map((s) => s.text).join('\n'));
    shortDescriptionSegments.push(segments);
  }

  return { shortDescriptions, shortDescriptionSegments };
}
