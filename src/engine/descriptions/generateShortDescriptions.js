import { renderStructuredBlock, renderCustomBlock, getEffectiveSongOverrides, resolveHookBlockOutput, renderTextTemplate, resolveHookOverride, pickViableTemplate, isSongOverrideActive } from './generateCustomBlocks';
import { isListBlock } from '../../utils/customBlocks';
import { buildHookBlockMaps } from '../../utils/descriptionLayout';

export function generateShortDescriptions(
  formData,
  projectConfig,
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
        source: picked && blockKey
          ? { type: 'block', blockKey, blockType: 'hook', template: picked.template }
          : undefined,
      };
    }

    if (isListBlock(customBlocks[blockName])) {
      const { text: rendered, pickedItem } = renderStructuredBlock(customBlocks[blockName], ctx, projectConfig.description.links);
      // Pad list blocks with blank lines so they stand apart from the
      // single-newline-joined surrounding lines.
      return {
        text: rendered ? `\n${rendered}\n` : '',
        source: rendered
          ? { type: 'block', blockKey: blockName, blockType: 'list', pickedItem }
          : undefined,
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
      const overridden = isSongOverrideActive(songOverrides, blockName);
      return {
        text,
        source: !text
          ? undefined
          : overridden
            ? { type: 'override', blockKey: blockName }
            : { type: 'block', blockKey: blockName, blockType: 'text' },
      };
    }

    // This branch only runs when a song override is active for a generic hook
    // block (see the resolveHookBlockOutput fallback below for the non-overridden
    // case) — the pool's own templates were never in play, so the source is the
    // override itself, not the Hook Blocks pool.
    const hookSongOverride = resolveHookOverride(songOverrides[blockName]);
    if (hookSongOverride) {
      const text = renderTextTemplate(hookSongOverride, projectConfig, formData, tagPhrase);
      const blockKey = layoutKeyToBlockKey[blockName] ?? blockName;
      return { text, source: text ? { type: 'override', blockKey } : undefined };
    }

    // resolveHookBlockOutput already resolves+fills placeholders (filtering out
    // empty-value candidates first); the legacy shortsConfig fallback needs its
    // own fill pass. {num}/{coverLabel} are shorts-specific, applied after either way.
    const hookBlockResult = resolveHookBlockOutput(blockName, ctx);
    const text =
      hookBlockResult?.text ??
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
      source: hookBlockResult
        ? { type: 'block', blockKey, blockType: 'hook', template: hookBlockResult.template }
        : undefined,
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
