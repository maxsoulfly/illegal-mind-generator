export function getTagRegistry(projectConfig = {}) {
  return projectConfig.tags || {};
}

export function getVisibleTags(projectConfig = {}, visibilityOverrides = {}) {
  return Object.entries(getTagRegistry(projectConfig)).filter(
    ([tagName, tag]) => {
      const override = visibilityOverrides[tagName];

      if (override !== undefined) {
        return override;
      }

      return tag.visible !== false;
    },
  );
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
