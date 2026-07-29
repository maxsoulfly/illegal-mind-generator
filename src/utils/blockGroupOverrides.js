// Pure read/write helpers for the Blocks → Groups tab's per-group override
// state: description.customBlockGroups/blockGroupOverrides. Setters return
// the patch object for the caller to pass to updateProjectOverride — this
// module never calls updateProjectOverride itself, matching
// hookBlockOverrides.js's and placeholderOverrides.js's convention.

export function isDynamicGroup(overriddenDesc, key) {
  const dynamicGroupKeys = new Set((overriddenDesc.customBlockGroups || []).map((g) => g.key));
  return dynamicGroupKeys.has(key);
}

export function patchGroupPatch(overriddenDesc, group, patch, dynamic) {
  if (dynamic) {
    return {
      description: {
        ...overriddenDesc,
        customBlockGroups: (overriddenDesc.customBlockGroups || []).map((g) =>
          g.key === group.key ? { ...g, ...patch } : g,
        ),
      },
    };
  }

  return {
    description: {
      ...overriddenDesc,
      blockGroupOverrides: {
        ...(overriddenDesc.blockGroupOverrides || {}),
        [group.key]: { ...(overriddenDesc.blockGroupOverrides?.[group.key] || {}), ...patch },
      },
    },
  };
}

export function resetGroupPatch(overriddenDesc, key) {
  const { [key]: _removed, ...remaining } = overriddenDesc.blockGroupOverrides || {};
  return { description: { ...overriddenDesc, blockGroupOverrides: remaining } };
}

export function deleteGroupPatch(overriddenDesc, group) {
  return {
    description: {
      ...overriddenDesc,
      customBlockGroups: (overriddenDesc.customBlockGroups || []).filter((g) => g.key !== group.key),
    },
  };
}

export function addGroupPatch(overriddenDesc, key, name, scope, target) {
  return {
    description: {
      ...overriddenDesc,
      customBlockGroups: [
        ...(overriddenDesc.customBlockGroups || []),
        { key, label: name, scope, target, children: [], isCore: false },
      ],
    },
  };
}
