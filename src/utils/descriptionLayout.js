import { getBlockLabel } from './customBlocks';

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
