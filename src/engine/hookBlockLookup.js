// Multiple hookBlocks entries can share one descriptionLayoutKey (e.g.
// closingSignal/philosophyLine both point at 'closingBlock'). Prefer the
// entry whose own `key` equals the requested key (the "self-named" one) —
// this is what lets a Block Group child reference a specific sibling by its
// own key even though that sibling also has a shared descriptionLayoutKey.
// Groups with no self-named entry fall back to the first descriptionLayoutKey
// match, same as before (mirrors buildHookBlockMaps's identical precedent).
export function findHookBlockByKey(hookBlocks, layoutKey) {
  return (
    hookBlocks.find((b) => b.key === layoutKey) ??
    hookBlocks.find((b) => (b.descriptionLayoutKey ?? b.key) === layoutKey)
  );
}

// Returns the templates array for a hook block identified by its layout key,
// or null if the key doesn't match any hook block entry.
export function resolveHookBlockTemplates(layoutKey, projectConfig) {
  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const block = findHookBlockByKey(hookBlocks, layoutKey);
  if (!block) return null;

  const { path, templateKey } = block;
  const long = projectConfig.description?.templates?.long || {};
  const shorts = projectConfig.description?.templates?.shorts || {};
  const desc = projectConfig.description || {};

  if (path === 'long') return long[templateKey] || [];
  if (path === 'top') return desc[templateKey] || [];
  if (path === 'shorts') return shorts[templateKey] || [];
  return [];
}
