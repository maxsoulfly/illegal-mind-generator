export function getTagRegistry(projectConfig = {}) {
  return projectConfig.tags || {};
}

export function getResolvedTagRegistry(projectConfig = {}, tagOverrides = {}) {
  const baseRegistry = getTagRegistry(projectConfig);

  return Object.entries(baseRegistry).reduce((registry, [tagName, tagData]) => {
    registry[tagName] = {
      ...tagData,
      ...(tagOverrides[tagName] || {}),
    };

    return registry;
  }, {});
}

export function getVisibleTags(projectConfig = {}, tagOverrides = {}) {
  return Object.entries(
    getResolvedTagRegistry(projectConfig, tagOverrides),
  ).filter(([, tag]) => tag.visible !== false);
}

export function getTagData(projectConfig = {}, tagName) {
  return getTagRegistry(projectConfig)[tagName];
}

export function getTagCategories(projectConfig = {}) {
  return [
    ...new Set(
      Object.values(getTagRegistry(projectConfig))
        .map((tag) => tag.category)
        .filter(Boolean),
    ),
  ].sort();
}

export function getTagCategory(projectConfig = {}, category) {
  return Object.values(getTagRegistry(projectConfig)).filter(
    (tag) => tag.category === category,
  );
}
