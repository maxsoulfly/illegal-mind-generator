export const SCOPE_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'song',    label: 'Song' },
];

export const TARGET_OPTIONS = [
  { value: 'long',   label: 'Long' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'both',   label: 'Long + Shorts' },
];

// Single source of truth for the three block types: their Blocks-tab subTab id
// (matches ProjectSettingsBlocks.jsx's SubTabNav ids) and display label.
// blockType keys ('list'/'text'/'hook') match generateShortDescriptions.js's
// source.blockType — anything deriving a subTab id or label from a blockType
// should read this instead of re-declaring its own mapping.
export const BLOCK_TYPE_SUBTABS = {
  list: { subTab: 'lists', label: 'Lists' },
  text: { subTab: 'text',  label: 'Text Blocks' },
  hook: { subTab: 'hooks', label: 'Hook Blocks' },
};

// Metadata for built-in customBlocks keys. Anything not listed here is a
// user-created block — its label falls back to blockData.name or a
// prettified version of its key.
export const KNOWN_CUSTOM_BLOCKS = {
  gearBlock: { label: 'Gear Used', defaultScope: 'song', defaultTarget: 'long' },
  playlistBlock: { label: 'Playlists', defaultScope: 'project', defaultTarget: 'long' },
  customCtaBlock: { label: 'Custom CTA', defaultScope: 'project', defaultTarget: 'long' },
  mixingCtaBlock: { label: 'Mixing CTA', defaultScope: 'project', defaultTarget: 'long' },
};

// customBlocks mixes list-shaped blocks ({ title, items }) with Text blocks
// — either a plain string (legacy, e.g. mixingCtaBlock) or the newer
// { name, text, scope, target, isCore } shape created from the UI.
export function isListBlock(value) {
  return Boolean(value) && typeof value === 'object' && Array.isArray(value.items);
}

export function isTextBlock(value) {
  if (typeof value === 'string') return true;
  return Boolean(value) && typeof value === 'object' && typeof value.text === 'string';
}

// Fallback for blocks created before itemType was an explicit field:
// infer from item shape rather than failing or defaulting to 'text'.
export function detectItemType(block) {
  if (block?.itemType === 'text' || block?.itemType === 'link') return block.itemType;
  return (block?.items ?? []).some((item) => 'link' in item) ? 'link' : 'text';
}

export function prettifyBlockKey(key) {
  return key
    .replace(/Block$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

export function getBlockLabel(key, blockData) {
  const known = KNOWN_CUSTOM_BLOCKS[key];
  return known?.label || blockData?.name || prettifyBlockKey(key);
}

export function updateLongKey(overrides, key, value) {
  return {
    description: {
      ...(overrides.description || {}),
      templates: {
        ...(overrides.description?.templates || {}),
        long: {
          ...(overrides.description?.templates?.long || {}),
          [key]: value,
        },
      },
    },
  };
}

export function removeLongKey(overrides, key) {
  const { [key]: _removed, ...remaining } =
    overrides?.description?.templates?.long || {};
  return {
    description: {
      ...(overrides.description || {}),
      templates: {
        ...(overrides.description?.templates || {}),
        long: remaining,
      },
    },
  };
}

// existingKeys must include every customBlocks key regardless of type
// (List and Text share one namespace) to avoid generating a key that
// collides with a block of the other type.
export function generateBlockKey(name, existingKeys) {
  const words = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const base = words
    .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join('') || 'block';

  let key = `${base}Block`;
  let suffix = 2;

  while (existingKeys.includes(key) || key === 'supportBlock') {
    key = `${base}Block${suffix}`;
    suffix += 1;
  }

  return key;
}

// One-time, self-healing repair for customBlocks keys that collide with a
// hook block's key/descriptionLayoutKey — a bug class generateBlockKey now
// prevents going forward (see its existingKeys callers), but pre-existing
// colliding data needs actual repair, not just prevention. A collision is
// silent and severe: generateDescriptions.js's `blocks` map spreads
// renderedCustomBlocks last, so a colliding customBlocks entry silently
// overwrites the hook block's computed value in the `blocks` map — the hook
// block's own templates never actually get used, with no error anywhere.
//
// Project-scoped colliding blocks are renamed automatically (key + any
// blockLabelOverrides entry, rewritten together so nothing points at the old
// key). The `layout` array is deliberately left untouched: since a colliding
// customBlocks key can never win a spot of its own in `layout` (the
// dynamicBlockKeys filter in LongDescriptionSettings.jsx excludes any
// customBlocks key already present in defaultLayout, which every hook-block
// layout key is), any occurrence of the old key in a saved `layout` array
// unambiguously belongs to the *hook block's* slot, not the renamed
// customBlocks entry — remapping it would incorrectly steal the hook block's
// layout position. The renamed block simply becomes available (not yet
// active) in the Descriptions layout builder, same as any newly created one.
//
// Song-scoped colliding blocks are left alone and returned in `skipped` — a
// safe rename here can't also migrate whatever per-song override data might
// exist across formData/savedEntries, which this function has no access to
// (that needs a human to resolve).
//
// Returns null if there's nothing to fix. Otherwise returns
// { patch, renamed, skipped } — `patch` is a ready-to-use argument for
// updateProjectOverride (already includes the rest of `description`
// untouched), `renamed`/`skipped` are { oldKey, newKey? }[] for logging/UI.
export function resolveCustomBlockCollisions(projectSettingsOverrides, hookBlocks) {
  const desc = projectSettingsOverrides?.description || {};
  const longTemplates = desc.templates?.long || {};
  const customBlocks = longTemplates.customBlocks || {};

  const layoutKeySet = new Set([
    ...hookBlocks.map((b) => b.key),
    ...hookBlocks.map((b) => b.descriptionLayoutKey ?? b.key),
  ]);

  const collidingKeys = Object.keys(customBlocks).filter((key) => layoutKeySet.has(key));
  if (collidingKeys.length === 0) return null;

  const isSongScoped = (key) => {
    const block = customBlocks[key];
    return (typeof block === 'object' && block?.scope) === 'song';
  };
  const toRename = collidingKeys.filter((key) => !isSongScoped(key));
  const skipped = collidingKeys.filter(isSongScoped).map((oldKey) => ({ oldKey }));

  if (toRename.length === 0) return { patch: null, renamed: [], skipped };

  const existingKeys = new Set([...Object.keys(customBlocks), ...layoutKeySet]);
  const nextCustomBlocks = { ...customBlocks };
  const nextBlockLabelOverrides = { ...(desc.blockLabelOverrides || {}) };
  const renamed = [];

  for (const oldKey of toRename) {
    let suffix = 2;
    let newKey = `${oldKey}${suffix}`;
    while (existingKeys.has(newKey)) {
      suffix += 1;
      newKey = `${oldKey}${suffix}`;
    }
    existingKeys.add(newKey);
    renamed.push({ oldKey, newKey });

    nextCustomBlocks[newKey] = nextCustomBlocks[oldKey];
    delete nextCustomBlocks[oldKey];

    if (oldKey in nextBlockLabelOverrides) {
      nextBlockLabelOverrides[newKey] = nextBlockLabelOverrides[oldKey];
      delete nextBlockLabelOverrides[oldKey];
    }
  }

  const patch = {
    description: {
      ...desc,
      blockLabelOverrides: nextBlockLabelOverrides,
      templates: {
        ...desc.templates,
        long: {
          ...longTemplates,
          customBlocks: nextCustomBlocks,
        },
      },
    },
  };

  return { patch, renamed, skipped };
}
