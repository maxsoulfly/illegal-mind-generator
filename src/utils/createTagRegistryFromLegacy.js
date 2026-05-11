function formatTagLabel(tag) {
  return tag
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const CATEGORY_MAP = {
  heavier: 'energy',
  darker: 'mood',
  hardcore: 'genre',
  punk: 'genre',
  metal: 'genre',
  'alt metal': 'genre',
  'nu metal': 'genre',
  easycore: 'genre',
  'pop punk': 'genre',
  'hardcore punk': 'genre',
  'skate punk': 'genre',

  slower: 'tempo',
  faster: 'tempo',

  modernized: 'production',
  faithful: 'intent',

  hebrew: 'language',
  russian: 'language',

  nostalgia: 'mood',
  '90s': 'era',
  '00s': 'era',
};

export function createTagRegistryFromLegacy(projectConfig = {}) {
  const availableTags = projectConfig.availableTags || [];

  const titleTagMap = projectConfig.title?.tagMap || {};
  const thumbnailTagMap = projectConfig.thumbnail?.tagMap || {};
  const descriptionTagMap = projectConfig.description?.tagMap || {};

  return availableTags.reduce((registry, tag) => {
    registry[tag] = {
      label: formatTagLabel(tag),
      category: CATEGORY_MAP[tag] || 'uncategorized',

      title: titleTagMap[tag] || [],
      thumbnail: thumbnailTagMap[tag] || [],

      description: descriptionTagMap[tag] || {
        technical: [],
        log: [],
        status: [],
      },
    };

    return registry;
  }, {});
}
