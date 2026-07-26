import {
  renderStructuredBlockFromPicked, pickStructuredBlock,
  renderCustomBlock, pickCustomBlockDefault,
  getEffectiveSongOverrides,
  pickHookBlockOutput, renderHookBlockOutput,
  renderTextTemplate, resolveHookOverride,
  pickViableTemplateFrozen, renderViableTemplateFrozen,
  isSongOverrideActive,
} from './generateCustomBlocks';
import { buildTagPhrase } from './descriptionTagHelpers';
import { isListBlock } from '../../utils/customBlocks';
import { buildHookBlockMaps } from '../../utils/descriptionLayout';

// PICK phase for one layout block within one Shorts variant: decides the
// block's KIND (deterministic given config — a fixed lookup, not random)
// and freezes whatever's random about its project-default content. Song
// overrides are deliberately not resolved here — see renderShortLine, which
// checks them live so typing/clearing one shows immediately.
function pickShortLine(blockName, ctx, shortsConfig, customBlocks) {
  if (blockName === 'coverLine') {
    return { blockName, kind: 'coverLine', picked: pickViableTemplateFrozen(shortsConfig.header || [], ctx) };
  }

  if (isListBlock(customBlocks[blockName])) {
    return { blockName, kind: 'list', picked: pickStructuredBlock(customBlocks[blockName], ctx) };
  }

  if (blockName in customBlocks) {
    return { blockName, kind: 'customBlock', picked: pickCustomBlockDefault(customBlocks[blockName], ctx) };
  }

  // Generic hook block pool, or (if no hook block matches this key at all)
  // the legacy shortsConfig[blockName] fallback pool.
  const pickedHook = pickHookBlockOutput(blockName, ctx);
  const pickedLegacy = pickedHook ? null : pickViableTemplateFrozen(shortsConfig[blockName] ?? [], ctx);
  return { blockName, kind: 'hookOrLegacy', pickedHook, pickedLegacy };
}

// RENDER phase: pure substitution against live formData/songOverrides — no
// randomness, safe to re-run on every relevant form edit.
function renderShortLine(picked, ctx, shortsConfig, coverLabel, formData, songOverrides, layoutKeyToBlockKey, links) {
  const { blockName } = picked;

  if (picked.kind === 'coverLine') {
    const rendered = renderViableTemplateFrozen(picked.picked, ctx);
    const text = rendered?.text ?? renderTextTemplate('{artist} - {song}', ctx.projectConfig, formData, ctx.tagLine);
    const filledText = text
      .replace(/\{coverLabel\}/g, coverLabel)
      .replace(/\{num\}/g, formData.signalNumber || '00');
    const blockKey = layoutKeyToBlockKey[blockName];
    return {
      text: filledText,
      source: rendered && blockKey
        ? { type: 'block', blockKey, blockType: 'hook', template: rendered.template }
        : undefined,
    };
  }

  if (picked.kind === 'list') {
    const { text: rendered, pickedItem } = renderStructuredBlockFromPicked(picked.picked, ctx, links);
    // Pad list blocks with blank lines so they stand apart from the
    // single-newline-joined surrounding lines.
    return {
      text: rendered ? `\n${rendered}\n` : '',
      source: rendered
        ? { type: 'block', blockKey: blockName, blockType: 'list', pickedItem }
        : undefined,
    };
  }

  if (picked.kind === 'customBlock') {
    const text = renderCustomBlock(picked.picked, ctx, links, songOverrides[blockName]?.trim());
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

  // kind === 'hookOrLegacy'. This branch only attributes to the override
  // when a live override is active for a generic hook block — the pool's own
  // templates were never in play, so the source is the override itself, not
  // the Hook Blocks pool.
  const hookSongOverride = resolveHookOverride(songOverrides[blockName]);
  if (hookSongOverride) {
    const text = renderTextTemplate(hookSongOverride, ctx.projectConfig, formData, ctx.tagLine);
    const blockKey = layoutKeyToBlockKey[blockName] ?? blockName;
    return { text, source: text ? { type: 'override', blockKey } : undefined };
  }

  const hookRendered = picked.pickedHook ? renderHookBlockOutput(picked.pickedHook, ctx) : null;
  const legacyText = !hookRendered && picked.pickedLegacy ? renderViableTemplateFrozen(picked.pickedLegacy, ctx)?.text : '';
  const text = hookRendered?.text ?? legacyText ?? '';

  const filledText = text
    .replace(/\{num\}/g, formData.signalNumber || '00')
    .replace(/\{coverLabel\}/g, coverLabel);

  // Only the generic hook-block path has a real editor to point to — the
  // legacy shortsConfig[blockName] fallback predates the Hook Blocks system
  // and has no dedicated block editor, so it stays unnavigable (no source).
  const blockKey = layoutKeyToBlockKey[blockName] ?? blockName;
  return {
    text: filledText,
    source: hookRendered
      ? { type: 'block', blockKey, blockType: 'hook', template: hookRendered.template }
      : undefined,
  };
}

// PICK phase: freezes ALL `count` independent variants' random selections up
// front — each variant gets its own independent picks (matching the old
// per-call independence between variants), not shared across variants.
// Frozen except via Transformation Tags / Regenerate / entry load-clear.
export function pickShortDescriptions(formData, projectConfig) {
  const shortsConfig = projectConfig.description.templates.shorts;
  const count = shortsConfig.count || 3;
  const shortsLayout = shortsConfig.layout || ['coverLine', 'hook', 'secondary'];
  // List blocks live under templates.long.customBlocks regardless of which
  // description(s) they target — target decides eligibility, not location.
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const tagPhrase = buildTagPhrase(formData, projectConfig);
  const ctx = { formData, projectConfig, tagLine: tagPhrase };

  const variants = Array.from({ length: count }, () =>
    shortsLayout.map((blockName) => pickShortLine(blockName, ctx, shortsConfig, customBlocks)),
  );

  return { variants };
}

// RENDER phase: pure substitution against live formData — no randomness, so
// it's safe (and the point) to re-run on every relevant form edit without
// re-picking which templates/hooks/items won in any variant.
export function renderShortDescriptions(picked, formData, projectConfig) {
  const shortsConfig = projectConfig.description.templates.shorts;
  const coverLabel = shortsConfig.coverLabel || '';
  const tagPhrase = buildTagPhrase(formData, projectConfig);
  const ctx = { formData, projectConfig, tagLine: tagPhrase };
  const links = projectConfig.description.links;
  const songOverrides = getEffectiveSongOverrides(formData);
  const { layoutKeyToBlockKey } = buildHookBlockMaps(projectConfig.description?.hookBlocks || []);

  const shortDescriptions = [];
  const shortDescriptionSegments = [];

  for (const variant of picked.variants) {
    const segments = variant
      .map((pickedLine) => renderShortLine(pickedLine, ctx, shortsConfig, coverLabel, formData, songOverrides, layoutKeyToBlockKey, links))
      .filter((s) => s.text);
    shortDescriptions.push(segments.map((s) => s.text).join('\n'));
    shortDescriptionSegments.push(segments);
  }

  return { shortDescriptions, shortDescriptionSegments };
}

// Back-compat convenience: pick + render in one call. `tagPhrase` param kept
// for signature compatibility with old callers — recomputed internally now
// (deterministic given formData.transformationTags, cheap either way) since
// pick and render each build their own ctx independently.
export function generateShortDescriptions(formData, projectConfig) {
  return renderShortDescriptions(pickShortDescriptions(formData, projectConfig), formData, projectConfig);
}
