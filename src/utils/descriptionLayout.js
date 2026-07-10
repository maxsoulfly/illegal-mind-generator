import { getBlockLabel, isListBlock, isTextBlock } from './customBlocks';

// Shared Shorts layout-slot fallback labels, used by ShortsDescriptionSettings's
// layout editor (keyed by layout slot, e.g. 'coverLine' — see makeLayoutLabelResolver).
export const KNOWN_SHORTS_BLOCK_META = {
  coverLine: { label: 'Cover Line' },
  header:    { label: 'Header' },
  primary:   { label: 'Primary' },
  secondary: { label: 'Secondary' },
  hook:      { label: 'Hook' },
};

// Derives the three lookup maps shared by both description layout builders.
// Called once per render in LongDescriptionSettings and ShortsDescriptionSettings.
export function buildHookBlockMaps(hookBlocks) {
  const layoutKey = (b) => b.descriptionLayoutKey ?? b.key;
  return {
    allLayoutKeys:      new Set(hookBlocks.map(layoutKey)),
    labelMap:           Object.fromEntries(hookBlocks.map((b) => [layoutKey(b), b.label])),
    layoutKeyToBlockKey: Object.fromEntries(hookBlocks.map((b) => [layoutKey(b), b.key])),
  };
}

// Returns a getLayoutBlockLabel(key) function closed over the resolved maps and overrides.
// knownMeta is the per-description-type fallback: KNOWN_BLOCK_META (Long) or
// KNOWN_SHORTS_BLOCK_META (Shorts).
export function makeLayoutLabelResolver({
  labelMap,
  layoutKeyToBlockKey,
  hookBlockLabelOverrides,
  blockLabelOverrides,
  knownMeta,
  customBlocks,
}) {
  return (key) => {
    const configKey = layoutKeyToBlockKey[key];
    return (
      (configKey && hookBlockLabelOverrides[configKey]) ||
      labelMap[key] ||
      blockLabelOverrides[key] ||
      knownMeta[key]?.label ||
      getBlockLabel(key, customBlocks[key])
    );
  };
}

// Same override precedence as makeLayoutLabelResolver, but keyed directly by
// customBlocks/hookBlocks config key (not a layout slot key) — for consumers
// that already have a resolved blockKey, e.g. DescriptionsPanel's `source.blockKey`
// (generateShortDescriptions.js resolves layout key → blockKey before attaching source).
export function makeBlockKeyLabelResolver({
  hookBlocks,
  hookBlockLabelOverrides,
  blockLabelOverrides,
  customBlocks,
}) {
  const hookBlockLabelByKey = Object.fromEntries(hookBlocks.map((b) => [b.key, b.label]));

  return (blockKey) =>
    hookBlockLabelOverrides[blockKey] ||
    hookBlockLabelByKey[blockKey] ||
    blockLabelOverrides[blockKey] ||
    getBlockLabel(blockKey, customBlocks[blockKey]);
}

// Resolves a layout-slot key to its block source descriptor: which editor
// (Hook Blocks/Lists/Text Blocks) it lives in and its config key. Mirrors
// LongDescriptionSettings.jsx/ShortsDescriptionSettings.jsx's getNavigateHandler
// branching exactly — both the nav-arrow click handlers and generateDescriptions.js's
// per-block `source` attribution (for DescriptionsPanel's hover tooltips) go through
// this single function so they can't drift apart. Returns undefined when a block
// key matches no hook block, list block, or text block (nothing to point at).
export function resolveBlockSource(blockKey, { hookBlockMaps, customBlocks, supportBlockConfig }) {
  const { allLayoutKeys, layoutKeyToBlockKey } = hookBlockMaps;

  if (allLayoutKeys.has(blockKey)) {
    return { type: 'block', blockKey: layoutKeyToBlockKey[blockKey], blockType: 'hook' };
  }

  // supportBlock lives directly on templates.long, not inside customBlocks.
  const blockData = blockKey === 'supportBlock' ? supportBlockConfig : customBlocks[blockKey];

  if (isListBlock(blockData)) {
    return { type: 'block', blockKey, blockType: 'list' };
  }
  if (isTextBlock(blockData)) {
    return { type: 'block', blockKey, blockType: 'text' };
  }

  return undefined;
}
