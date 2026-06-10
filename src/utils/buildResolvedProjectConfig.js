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
