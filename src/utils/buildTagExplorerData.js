export function buildTagExplorerData(projectConfig, savedEntries = []) {
  const availableTags = projectConfig.availableTags || [];

  const titleTagMap = projectConfig.title?.tagMap || {};
  const thumbnailTagMap = projectConfig.thumbnail?.tagMap || {};
  const descriptionTagMap = projectConfig.description?.tagMap || {};

  return availableTags.map((tag) => {
    const usedBySongs = savedEntries.filter((entry) =>
      entry.transformationTags?.includes(tag),
    );

    const hasMissingMappings =
      !titleTagMap[tag] || !thumbnailTagMap[tag] || !descriptionTagMap[tag];

    const isUnused = usedBySongs.length === 0;

    const isPopular = usedBySongs.length >= 3;

    return {
      name: tag,
      usageCount: usedBySongs.length,

      maps: {
        title: titleTagMap[tag] || [],
        thumbnail: thumbnailTagMap[tag] || [],
        description: descriptionTagMap[tag] || null,
      },

      existsIn: {
        title: Boolean(titleTagMap[tag]),
        thumbnail: Boolean(thumbnailTagMap[tag]),
        description: Boolean(descriptionTagMap[tag]),
      },

      // 👉 ADD THESE
      hasMissingMappings,
      isUnused,
      isPopular,

      usedBySongs,
    };
  });
}
