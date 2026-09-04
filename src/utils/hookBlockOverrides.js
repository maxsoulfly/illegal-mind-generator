// Pure read/write helpers for the Blocks → Hook Blocks tab's per-block
// override state: description.hookBlockMaxLines/hookBlockCounts/
// hookBlockTargets/hookBlockLabelOverrides/hookBlockOverrideTypes/
// hookBlockAiContexts, description.templates.long.phraseBlockScopes,
// description.customHookBlocks.
// Getters read from projectConfig/projectSettingsOverrides directly; setters
// return the patch object for the caller to pass to updateProjectOverride —
// this module never calls updateProjectOverride itself, matching how every
// other Project Settings tab wires its own patches inline.

function getOverriddenDesc(projectSettingsOverrides) {
  return projectSettingsOverrides.description || {};
}

function getOverriddenLong(projectSettingsOverrides) {
  return projectSettingsOverrides.description?.templates?.long || {};
}

function getOverriddenShorts(projectSettingsOverrides) {
  return projectSettingsOverrides.description?.templates?.shorts || {};
}

export function getTemplates(projectConfig, { path, templateKey }) {
  const longTemplates = projectConfig.description?.templates?.long || {};
  const shortsTemplates = projectConfig.description?.templates?.shorts || {};
  const descConfig = projectConfig.description || {};
  if (path === 'long') return longTemplates[templateKey] || [];
  if (path === 'top') return descConfig[templateKey] || [];
  if (path === 'shorts') return shortsTemplates[templateKey] || [];
  return [];
}

export function getMaxLines(projectSettingsOverrides, { key, countMax }) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return overriddenDesc.hookBlockMaxLines?.[key] ?? countMax ?? 1;
}

export function getCountValue(projectSettingsOverrides, block) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const max = getMaxLines(projectSettingsOverrides, block);
  const stored = overriddenDesc.hookBlockCounts?.[block.key] ?? block.countDefault ?? 1;
  return Math.min(stored, max);
}

export function getTarget(projectSettingsOverrides, { key, path }) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return overriddenDesc.hookBlockTargets?.[key] ?? (path === 'shorts' ? 'shorts' : 'long');
}

export function isOverridden(projectSettingsOverrides, { key, path, templateKey }) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const overriddenLong = getOverriddenLong(projectSettingsOverrides);
  const overriddenShorts = getOverriddenShorts(projectSettingsOverrides);
  const tplOverridden =
    path === 'long'
      ? templateKey in overriddenLong
      : path === 'top'
        ? templateKey in overriddenDesc
        : path === 'shorts'
          ? templateKey in overriddenShorts
          : false;
  return (
    tplOverridden ||
    (overriddenDesc.hookBlockMaxLines != null && key in overriddenDesc.hookBlockMaxLines) ||
    (overriddenDesc.hookBlockCounts != null && key in overriddenDesc.hookBlockCounts) ||
    (overriddenDesc.hookBlockTargets != null && key in overriddenDesc.hookBlockTargets) ||
    (overriddenDesc.hookBlockOverrideTypes != null && key in overriddenDesc.hookBlockOverrideTypes) ||
    (overriddenDesc.hookBlockAiContexts != null && key in overriddenDesc.hookBlockAiContexts)
  );
}

export function getOverrideType(projectSettingsOverrides, key) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return overriddenDesc.hookBlockOverrideTypes?.[key] ?? 'textarea';
}

// defaultScope is per-block config (projects.json), not a hardcoded key
// check — storyBlock/logBlock set it to 'song' there since that's their
// historical default; every other hook block implicitly defaults to
// 'project'. Must match AdvancedDescriptionFields.jsx's precedence exactly.
export function getScope(projectSettingsOverrides, key, defaultScope) {
  const overriddenLong = getOverriddenLong(projectSettingsOverrides);
  return overriddenLong.phraseBlockScopes?.[key] ?? defaultScope ?? 'project';
}

export function getHookBlockCore(projectSettingsOverrides, key) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return (overriddenDesc.customHookBlocks || []).find((b) => b.key === key)?.isCore || false;
}

// aiContext is optional, user-authored explanation of a block's purpose
// (Copy AI Prompt feature) — never derived from the block name/templates,
// never seeded in projects.json. `block.aiContext` is always undefined for
// every JSON-default block today; the override map is the only real source.
export function getAiContext(projectSettingsOverrides, key, block) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return overriddenDesc.hookBlockAiContexts?.[key] ?? block?.aiContext ?? '';
}

export function updateTemplatesPatch(projectSettingsOverrides, { path, templateKey }, newTemplates) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const overriddenLong = getOverriddenLong(projectSettingsOverrides);
  const overriddenShorts = getOverriddenShorts(projectSettingsOverrides);
  const templates_ = projectSettingsOverrides.description?.templates || {};
  if (path === 'long') {
    return {
      description: {
        ...overriddenDesc,
        templates: { ...templates_, long: { ...overriddenLong, [templateKey]: newTemplates } },
      },
    };
  }
  if (path === 'top') {
    return { description: { ...overriddenDesc, [templateKey]: newTemplates } };
  }
  if (path === 'shorts') {
    return {
      description: {
        ...overriddenDesc,
        templates: { ...templates_, shorts: { ...overriddenShorts, [templateKey]: newTemplates } },
      },
    };
  }
  return { description: overriddenDesc };
}

export function resetBlockPatch(projectSettingsOverrides, { key, path, templateKey }) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const overriddenLong = getOverriddenLong(projectSettingsOverrides);
  const overriddenShorts = getOverriddenShorts(projectSettingsOverrides);
  const templates_ = projectSettingsOverrides.description?.templates || {};
  const { [key]: _mx, ...remainingMaxLines } = overriddenDesc.hookBlockMaxLines || {};
  const { [key]: _cv, ...remainingCounts } = overriddenDesc.hookBlockCounts || {};
  const { [key]: _tgt, ...remainingTargets } = overriddenDesc.hookBlockTargets || {};
  const { [key]: _lbl, ...remainingLabelOverrides } = overriddenDesc.hookBlockLabelOverrides || {};
  const { [key]: _ot, ...remainingOverrideTypes } = overriddenDesc.hookBlockOverrideTypes || {};
  const { [key]: _ai, ...remainingAiContexts } = overriddenDesc.hookBlockAiContexts || {};

  if (path === 'long') {
    const { [templateKey]: _t, ...remainingLong } = overriddenLong;
    return {
      description: {
        ...overriddenDesc,
        hookBlockMaxLines: remainingMaxLines,
        hookBlockCounts: remainingCounts,
        hookBlockTargets: remainingTargets,
        hookBlockLabelOverrides: remainingLabelOverrides,
        hookBlockOverrideTypes: remainingOverrideTypes,
        hookBlockAiContexts: remainingAiContexts,
        templates: { ...templates_, long: remainingLong },
      },
    };
  }
  if (path === 'top') {
    const { [templateKey]: _t, ...remaining } = overriddenDesc;
    return {
      description: {
        ...remaining,
        hookBlockMaxLines: remainingMaxLines,
        hookBlockCounts: remainingCounts,
        hookBlockTargets: remainingTargets,
        hookBlockLabelOverrides: remainingLabelOverrides,
        hookBlockOverrideTypes: remainingOverrideTypes,
        hookBlockAiContexts: remainingAiContexts,
      },
    };
  }
  if (path === 'shorts') {
    const { [templateKey]: _t, ...remainingShorts } = overriddenShorts;
    return {
      description: {
        ...overriddenDesc,
        hookBlockMaxLines: remainingMaxLines,
        hookBlockCounts: remainingCounts,
        hookBlockTargets: remainingTargets,
        hookBlockLabelOverrides: remainingLabelOverrides,
        hookBlockOverrideTypes: remainingOverrideTypes,
        hookBlockAiContexts: remainingAiContexts,
        templates: { ...templates_, shorts: remainingShorts },
      },
    };
  }
  return { description: overriddenDesc };
}

export function renameJsonBlockPatch(projectSettingsOverrides, key, newLabel) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return {
    description: {
      ...overriddenDesc,
      hookBlockLabelOverrides: {
        ...(overriddenDesc.hookBlockLabelOverrides || {}),
        [key]: newLabel,
      },
    },
  };
}

export function renameDynamicBlockPatch(projectSettingsOverrides, key, newLabel) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return {
    description: {
      ...overriddenDesc,
      customHookBlocks: (overriddenDesc.customHookBlocks || []).map((b) =>
        b.key === key ? { ...b, label: newLabel } : b,
      ),
    },
  };
}

export function updateOverrideTypePatch(projectSettingsOverrides, key, value) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return {
    description: {
      ...overriddenDesc,
      hookBlockOverrideTypes: {
        ...(overriddenDesc.hookBlockOverrideTypes || {}),
        [key]: value,
      },
    },
  };
}

export function updateScopePatch(projectSettingsOverrides, key, scope) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const overriddenLong = getOverriddenLong(projectSettingsOverrides);
  const templates_ = projectSettingsOverrides.description?.templates || {};
  return {
    description: {
      ...overriddenDesc,
      templates: {
        ...templates_,
        long: {
          ...overriddenLong,
          phraseBlockScopes: {
            ...(overriddenLong.phraseBlockScopes || {}),
            [key]: scope,
          },
        },
      },
    },
  };
}

export function updateTargetPatch(projectSettingsOverrides, key, value) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return {
    description: {
      ...overriddenDesc,
      hookBlockTargets: {
        ...(overriddenDesc.hookBlockTargets || {}),
        [key]: value,
      },
    },
  };
}

export function updateMaxLinesPatch(projectSettingsOverrides, key, value) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return {
    description: {
      ...overriddenDesc,
      hookBlockMaxLines: {
        ...(overriddenDesc.hookBlockMaxLines || {}),
        [key]: value,
      },
    },
  };
}

// value === '' deletes the key instead of storing an empty string, so
// isOverridden/the reset icon stay honest about whether anything is actually
// set (matches "blank the field" reading as "no override" everywhere else
// in this module).
export function updateAiContextPatch(projectSettingsOverrides, key, value) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const trimmed = (value || '').trim();
  const { [key]: _removed, ...remaining } = overriddenDesc.hookBlockAiContexts || {};
  return {
    description: {
      ...overriddenDesc,
      hookBlockAiContexts: trimmed ? { ...remaining, [key]: value } : remaining,
    },
  };
}

export function updateCountPatch(projectSettingsOverrides, key, value) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return {
    description: {
      ...overriddenDesc,
      hookBlockCounts: {
        ...(overriddenDesc.hookBlockCounts || {}),
        [key]: value,
      },
    },
  };
}

export function toggleHookBlockCorePatch(projectSettingsOverrides, key) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  return {
    description: {
      ...overriddenDesc,
      customHookBlocks: (overriddenDesc.customHookBlocks || []).map((b) =>
        b.key === key ? { ...b, isCore: !b.isCore } : b,
      ),
    },
  };
}

export function addHookBlockPatch(projectSettingsOverrides, key, name, scope, target) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const overriddenLong = getOverriddenLong(projectSettingsOverrides);
  const templates_ = projectSettingsOverrides.description?.templates || {};
  return {
    description: {
      ...overriddenDesc,
      customHookBlocks: [
        ...(overriddenDesc.customHookBlocks || []),
        { key, label: name, isCore: false },
      ],
      hookBlockTargets: { ...(overriddenDesc.hookBlockTargets || {}), [key]: target },
      templates: {
        ...templates_,
        long: {
          ...overriddenLong,
          phraseBlockScopes: {
            ...(overriddenLong.phraseBlockScopes || {}),
            [key]: scope,
          },
        },
      },
    },
  };
}

export function deleteHookBlockPatch(projectSettingsOverrides, key) {
  const overriddenDesc = getOverriddenDesc(projectSettingsOverrides);
  const overriddenLong = getOverriddenLong(projectSettingsOverrides);
  const templates_ = projectSettingsOverrides.description?.templates || {};
  const { [key]: _tpl, ...remainingLongBase } = overriddenLong;
  const { [key]: _sc, ...remainingScopes } = overriddenLong.phraseBlockScopes || {};
  const { [key]: _mx, ...remainingMaxLines } = overriddenDesc.hookBlockMaxLines || {};
  const { [key]: _cv, ...remainingCounts } = overriddenDesc.hookBlockCounts || {};
  const { [key]: _tgt, ...remainingTargets } = overriddenDesc.hookBlockTargets || {};
  const { [key]: _ot, ...remainingOverrideTypes } = overriddenDesc.hookBlockOverrideTypes || {};
  const { [key]: _ai, ...remainingAiContexts } = overriddenDesc.hookBlockAiContexts || {};
  return {
    description: {
      ...overriddenDesc,
      customHookBlocks: (overriddenDesc.customHookBlocks || []).filter((b) => b.key !== key),
      hookBlockMaxLines: remainingMaxLines,
      hookBlockCounts: remainingCounts,
      hookBlockTargets: remainingTargets,
      hookBlockOverrideTypes: remainingOverrideTypes,
      hookBlockAiContexts: remainingAiContexts,
      templates: {
        ...templates_,
        long: { ...remainingLongBase, phraseBlockScopes: remainingScopes },
      },
    },
  };
}
