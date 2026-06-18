export const SCOPE_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'song',    label: 'Song' },
];

export const TARGET_OPTIONS = [
  { value: 'long',   label: 'Long' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'both',   label: 'Long + Shorts' },
];

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
