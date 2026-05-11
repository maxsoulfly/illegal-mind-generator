export function buildTagExplorerData(projectConfig, savedEntries = []) {
  const availableTags = projectConfig.availableTags || [];
  const tagRegistry = projectConfig.tags || {};

  const titleTagMap = projectConfig.title?.tagMap || {};
  const thumbnailTagMap = projectConfig.thumbnail?.tagMap || {};
  const descriptionTagMap = projectConfig.description?.tagMap || {};

  return availableTags.map((tag) => {
    const usedBySongs = savedEntries.filter((entry) =>
      entry.transformationTags?.includes(tag),
    );

    const registryTag = tagRegistry[tag];

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
        title: registryTag?.title || titleTagMap[tag] || [],
        thumbnail: registryTag?.thumbnail || thumbnailTagMap[tag] || [],
        description: registryTag?.description || descriptionTagMap[tag] || null,
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

      // 👉 ADD THESE
      hasMissingMappings,
      isUnused,
      isPopular,

      usedBySongs,
    };
  });
}
