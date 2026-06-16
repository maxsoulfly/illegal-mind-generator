// Metadata for built-in customBlocks keys. Anything not listed here is a
// user-created block — its label falls back to blockData.name or a
// prettified version of its key.
export const KNOWN_CUSTOM_BLOCKS = {
  gearBlock: { label: 'Gear Used', defaultScope: 'song', defaultTarget: 'long' },
  playlistBlock: { label: 'Playlists', defaultScope: 'project', defaultTarget: 'long' },
  customCtaBlock: { label: 'Custom CTA', defaultScope: 'project', defaultTarget: 'long' },
};

// customBlocks mixes list-shaped blocks ({ title, items }) with plain-string
// Text blocks (e.g. mixingCtaBlock) — only list-shaped ones are List blocks.
export function isListBlock(value) {
  return Boolean(value) && typeof value === 'object' && Array.isArray(value.items);
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
