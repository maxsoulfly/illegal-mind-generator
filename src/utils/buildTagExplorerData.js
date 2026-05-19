export function buildTagExplorerData(
  projectConfig,
  savedEntries = [],
  tagOverrides = {},
) {
  const availableTags = [
    ...new Set([
      ...(projectConfig.availableTags || []),
      ...Object.keys(projectConfig.tags || {}),
    ]),
  ];
  const tagRegistry = projectConfig.tags || {};

  const titleTagMap = projectConfig.title?.tagMap || {};
  const thumbnailTagMap = projectConfig.thumbnail?.tagMap || {};
  const descriptionTagMap = projectConfig.description?.tagMap || {};

  return availableTags.map((tag) => {
    const baseTag = tagRegistry[tag] || {};
    const tagOverride = tagOverrides[tag] || {};

    const registryTag = {
      ...baseTag,
      ...tagOverride,
    };

    const usedBySongs = savedEntries.filter((entry) =>
      entry.transformationTags?.includes(tag),
    );
    const isVisible =
      tagOverride?.visible !== undefined
        ? tagOverride.visible
        : registryTag?.visible !== false;

    const isRegistryDriven =
      registryTag?.title && registryTag?.thumbnail && registryTag?.description;

    const hasMissingMappings =
      (!registryTag?.title && !titleTagMap[tag]) ||
      (!registryTag?.thumbnail && !thumbnailTagMap[tag]) ||
      (!registryTag?.description && !descriptionTagMap[tag]);

    const isUnused = usedBySongs.length === 0;

    const isPopular = usedBySongs.length >= 3;

    return {
      name: tag,
      usageCount: usedBySongs.length,

      maps: {
        title: registryTag.title || [],
        thumbnail: registryTag.thumbnail || [],
        description: registryTag.description || null,
      },

      existsIn: {
        title: Boolean(registryTag?.title || titleTagMap[tag]),
        thumbnail: Boolean(registryTag?.thumbnail || thumbnailTagMap[tag]),
        description: Boolean(
          registryTag?.description || descriptionTagMap[tag],
        ),
      },

      label: registryTag?.label || tag,
      category: registryTag?.category || 'uncategorized',

      hasMissingMappings,
      isUnused,
      isPopular,

      usedBySongs,
      isRegistryDriven,
      isVisible,
    };
  });
}
