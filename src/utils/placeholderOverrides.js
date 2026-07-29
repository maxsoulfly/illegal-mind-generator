// Pure read/write helpers for the Blocks → Placeholders tab's per-placeholder
// override state: description.customPlaceholders/placeholderOverrides.
// Setters return the patch object for the caller to pass to
// updateProjectOverride — this module never calls updateProjectOverride
// itself, matching hookBlockOverrides.js's convention.

export function isDynamicPlaceholder(overriddenDesc, key) {
  const dynamicKeys = new Set((overriddenDesc.customPlaceholders || []).map((p) => p.key));
  return dynamicKeys.has(key);
}

export function sourceToFieldValue(source = {}) {
  if (!source.tagField) return '';
  return source.tagParentField ? `${source.tagParentField}.${source.tagField}` : source.tagField;
}

export function fieldValueToSource(value, existingSource = {}) {
  const { hookBlockKey, shortHookPool } = existingSource;
  const carried = { ...(hookBlockKey ? { hookBlockKey } : {}), ...(shortHookPool ? { shortHookPool } : {}) };
  if (!value) return carried;
  const [tagParentField, tagField] = value.split('.');
  return { tagParentField, tagField, ...carried };
}

// Placeholder keys are a separate namespace from hookBlocks/customBlocks/
// blockGroups (addressed as {custom.<key>} tokens, never bare layout/editor
// keys — see placeholders.js) — no "Block" suffix, no cross-namespace
// collision check needed, so this doesn't reuse generateBlockKey.
export function generatePlaceholderKey(name, existingKeys) {
  const words = name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const base = words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('') || 'placeholder';
  let key = base;
  let suffix = 2;
  while (existingKeys.includes(key)) {
    key = `${base}${suffix}`;
    suffix += 1;
  }
  return key;
}

export function patchPlaceholderPatch(overriddenDesc, placeholder, patch, dynamic) {
  if (dynamic) {
    return {
      description: {
        ...overriddenDesc,
        customPlaceholders: (overriddenDesc.customPlaceholders || []).map((p) =>
          p.key === placeholder.key ? { ...p, ...patch } : p,
        ),
      },
    };
  }

  return {
    description: {
      ...overriddenDesc,
      placeholderOverrides: {
        ...(overriddenDesc.placeholderOverrides || {}),
        [placeholder.key]: { ...(overriddenDesc.placeholderOverrides?.[placeholder.key] || {}), ...patch },
      },
    },
  };
}

export function resetPlaceholderPatch(overriddenDesc, key) {
  const { [key]: _removed, ...remaining } = overriddenDesc.placeholderOverrides || {};
  return { description: { ...overriddenDesc, placeholderOverrides: remaining } };
}

export function deletePlaceholderPatch(overriddenDesc, placeholder) {
  return {
    description: {
      ...overriddenDesc,
      customPlaceholders: (overriddenDesc.customPlaceholders || []).filter((p) => p.key !== placeholder.key),
    },
  };
}

export function addPlaceholderPatch(overriddenDesc, key, name) {
  return {
    description: {
      ...overriddenDesc,
      customPlaceholders: [
        ...(overriddenDesc.customPlaceholders || []),
        { key, label: name, source: {}, count: 1, isCore: false },
      ],
    },
  };
}
