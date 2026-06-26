function mergeProjectOverrides(projectConfig, projectSettingsOverrides = {}) {
  return {
    ...projectConfig,
    ...projectSettingsOverrides,

    title: {
      ...(projectConfig.title || {}),
      ...(projectSettingsOverrides.title || {}),
      templates: {
        ...(projectConfig.title?.templates || {}),
        ...(projectSettingsOverrides.title?.templates || {}),
      },
    },

    shortHookTypes: {
      ...(projectConfig.shortHookTypes || {}),
      ...(projectSettingsOverrides.shortHookTypes || {}),
    },

    thumbnail: {
      ...(projectConfig.thumbnail || {}),
      ...(projectSettingsOverrides.thumbnail || {}),
      patterns: {
        ...(projectConfig.thumbnail?.patterns || {}),
        ...(projectSettingsOverrides.thumbnail?.patterns || {}),
      },
    },

    description: {
      ...(projectConfig.description || {}),
      ...(projectSettingsOverrides.description || {}),
      templates: {
        ...(projectConfig.description?.templates || {}),
        ...(projectSettingsOverrides.description?.templates || {}),
        long: {
          ...(projectConfig.description?.templates?.long || {}),
          ...(projectSettingsOverrides.description?.templates?.long || {}),
          customBlocks: {
            ...(projectConfig.description?.templates?.long?.customBlocks || {}),
            ...(projectSettingsOverrides.description?.templates?.long?.customBlocks || {}),
          },
          phraseBlockScopes: {
            ...(projectConfig.description?.templates?.long?.phraseBlockScopes || {}),
            ...(projectSettingsOverrides.description?.templates?.long?.phraseBlockScopes || {}),
          },
        },
        shorts: {
          ...(projectConfig.description?.templates?.shorts || {}),
          ...(projectSettingsOverrides.description?.templates?.shorts || {}),
        },
      },
      links: {
        ...(projectConfig.description?.links || {}),
        ...(projectSettingsOverrides.description?.links || {}),
      },
    },
  };
}

export default function buildResolvedProjectConfig(
  projectConfig,
  tagOverrides,
  projectSettingsOverrides,
) {
  const nextConfig = structuredClone(
    mergeProjectOverrides(projectConfig, projectSettingsOverrides),
  );

  // Append user-created hook blocks (stored in overrides) to the resolved
  // hookBlocks array so all downstream code sees them alongside JSON-defined ones.
  // Filter out any stale customHookBlocks entry whose key already exists in the
  // base JSON hookBlocks — prevents duplicates caused by stale localStorage data.
  const customHookBlocks = nextConfig.description?.customHookBlocks || [];
  if (customHookBlocks.length) {
    const baseHookKeys = new Set(
      (projectConfig.description?.hookBlocks || []).map((b) => b.key),
    );
    nextConfig.description.hookBlocks = [
      ...(projectConfig.description?.hookBlocks || []),
      ...customHookBlocks
        .filter((b) => !baseHookKeys.has(b.key))
        .map((b) => ({
          key: b.key,
          label: b.label,
          path: 'long',
          templateKey: b.key,
        })),
    ];
  }

  Object.entries(tagOverrides || {}).forEach(([tagName, override]) => {
    const baseTag = nextConfig.tags?.[tagName] || {};

    nextConfig.tags[tagName] = {
      ...baseTag,
      ...override,
      description: {
        ...(baseTag.description || {}),
        ...(override.description || {}),
      },
    };
  });

  return nextConfig;
}
