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
//
// Multiple hookBlocks entries can share one descriptionLayoutKey (e.g.
// broadcastHeader/operatorStatuses/statusLines all point at 'broadcastBlock').
// Plain last-one-wins is fine when every entry in the group genuinely
// contributes to that block's generation — but logBlock's group also includes
// tagLineFallbacks/tagLineTemplates, which the log block's own resolution
// never reads at all, so last-wins was landing on a config key with zero
// relation to the actual generated text. Prefer the entry whose own `key` equals the layout
// key (the "self-named" one, e.g. logBlock's own entry) when one exists —
// groups with no self-named entry (broadcastBlock, closingBlock) keep the
// existing last-one-wins behavior unchanged.
export function buildHookBlockMaps(hookBlocks) {
  const layoutKey = (b) => b.descriptionLayoutKey ?? b.key;

  const layoutKeyToBlockKey = Object.fromEntries(hookBlocks.map((b) => [layoutKey(b), b.key]));
  const labelMap = Object.fromEntries(hookBlocks.map((b) => [layoutKey(b), b.label]));
  for (const b of hookBlocks) {
    if (b.key === layoutKey(b)) {
      layoutKeyToBlockKey[layoutKey(b)] = b.key;
      labelMap[layoutKey(b)] = b.label;
    }
  }

  return {
    allLayoutKeys: new Set(hookBlocks.map(layoutKey)),
    labelMap,
    layoutKeyToBlockKey,
  };
}

// Derives the Block Group lookup maps, the group-side sibling to
// buildHookBlockMaps above. groupKeySet lets resolveBlockSource recognize a
// layout/blockKey as belonging to a group (checked before the hook-block/
// customBlocks branches, since a group can legitimately reuse an existing
// hook-block layout key — see closingBlock). labelMap feeds both label
// resolvers below so a group's own label/rename wins over its children's
// individual (and, pre-Group, ambiguous last-one-wins) labels.
export function buildBlockGroupMaps(blockGroups) {
  return {
    groupKeySet: new Set(blockGroups.map((g) => g.key)),
    labelMap: Object.fromEntries(blockGroups.map((g) => [g.key, g.label])),
  };
}

// Returns a getLayoutBlockLabel(key) function closed over the resolved maps and overrides.
// knownMeta is the per-description-type fallback: KNOWN_BLOCK_META (Long) or
// KNOWN_SHORTS_BLOCK_META (Shorts). blockGroupLabelMap (buildBlockGroupMaps's
// labelMap) takes top precedence — a Group's own label must win over
// whatever its children's labelMap/hookBlockLabelOverrides entries say.
export function makeLayoutLabelResolver({
  labelMap,
  layoutKeyToBlockKey,
  hookBlockLabelOverrides,
  blockLabelOverrides,
  knownMeta,
  customBlocks,
  blockGroupLabelMap = {},
}) {
  return (key) => {
    const configKey = layoutKeyToBlockKey[key];
    return (
      blockGroupLabelMap[key] ||
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
  blockGroupLabelMap = {},
}) {
  const hookBlockLabelByKey = Object.fromEntries(hookBlocks.map((b) => [b.key, b.label]));

  return (blockKey) =>
    blockGroupLabelMap[blockKey] ||
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
//
// `overridden` (default false) lets a caller that knows a song-level override
// currently wins for this block (see isSongOverrideActive in generateCustomBlocks.js)
// swap the usual project-pool source for an `{ type: 'override' }` one instead —
// the settings-page nav-arrow callers never pass this, since Project Settings always
// means "the project pool," regardless of any specific song's override state.
//
// An override's `blockKey` is deliberately the incoming *layout* key, not the
// resolved Hook Blocks config key — formData.songBlockOverrides (and the
// Generator's Advanced Options fields) are keyed by layout key (e.g.
// 'introBlock'), which can differ from the hook block's own config key (e.g.
// 'introHook') via descriptionLayoutKey. The non-overridden 'block' case still
// resolves to the config key, since that's what the Hook Blocks *editor* uses.
//
// `blockGroupMaps` (buildBlockGroupMaps's output, optional) is checked first:
// a Group can reuse an existing hook-block layout key (closingBlock is both
// the group's own key AND closingSignal/philosophyLine's shared
// descriptionLayoutKey), and the group must win that ambiguity — it's the
// thing actually producing the segment now, not any one child in isolation.
export function resolveBlockSource(blockKey, { hookBlockMaps, customBlocks, supportBlockConfig, blockGroupMaps, overridden = false }) {
  if (blockGroupMaps?.groupKeySet.has(blockKey)) {
    return overridden ? { type: 'override', blockKey } : { type: 'block', blockKey, blockType: 'group' };
  }

  const { allLayoutKeys, layoutKeyToBlockKey } = hookBlockMaps;

  if (allLayoutKeys.has(blockKey)) {
    if (overridden) return { type: 'override', blockKey };
    return { type: 'block', blockKey: layoutKeyToBlockKey[blockKey], blockType: 'hook' };
  }

  // supportBlock lives directly on templates.long, not inside customBlocks.
  const blockData = blockKey === 'supportBlock' ? supportBlockConfig : customBlocks[blockKey];

  if (isListBlock(blockData)) {
    return overridden ? { type: 'override', blockKey } : { type: 'block', blockKey, blockType: 'list' };
  }
  if (isTextBlock(blockData)) {
    return overridden ? { type: 'override', blockKey } : { type: 'block', blockKey, blockType: 'text' };
  }

  return undefined;
}
