import { resolveTagOverride } from './resolveTagOverride';

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

    const registryTag = resolveTagOverride(baseTag, tagOverride);
    // resolveTagOverride always produces a description object ({} at minimum);
    // this tracks whether either side actually had one, matching the previous
    // undefined-vs-{} distinction used below without baking it into the shared
    // merge (which also feeds generation, where always-{} is correct).
    const hasDescriptionSource = Boolean(baseTag.description || tagOverride.description);

    const usedBySongs = savedEntries.filter((entry) =>
      entry.transformationTags?.includes(tag),
    );
    const isVisible =
      tagOverride?.visible !== undefined
        ? tagOverride.visible
        : registryTag?.visible !== false;

    const isRegistryDriven =
      registryTag?.title && registryTag?.thumbnail && hasDescriptionSource;

    const hasMissingMappings =
      (!registryTag?.title && !titleTagMap[tag]) ||
      (!registryTag?.thumbnail && !thumbnailTagMap[tag]) ||
      (!hasDescriptionSource && !descriptionTagMap[tag]);

    const isUnused = usedBySongs.length === 0;

    const isPopular = usedBySongs.length >= 3;

    return {
      name: tag,
      usageCount: usedBySongs.length,

      maps: {
        title: registryTag.title || [],
        thumbnail: registryTag.thumbnail || [],
        description: hasDescriptionSource ? registryTag.description : null,
        shortHooks: registryTag.shortHooks || {},
        hashtags: registryTag.hashtags || [],
      },

      existsIn: {
        title: Boolean(registryTag?.title || titleTagMap[tag]),
        thumbnail: Boolean(registryTag?.thumbnail || thumbnailTagMap[tag]),
        description: Boolean(hasDescriptionSource || descriptionTagMap[tag]),
      },

      label: registryTag?.label || tag,
      category: registryTag?.category || 'uncategorized',
      hashtags: registryTag.hashtags || [],
      excludeFromHashtags: Boolean(registryTag.excludeFromHashtags),
      excludeFromButIts: Boolean(registryTag.excludeFromButIts),

      hasMissingMappings,
      isUnused,
      isPopular,

      usedBySongs,
      isRegistryDriven,
      isVisible,
    };
  });
}
