import { getBlockLabel } from './customBlocks';

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
