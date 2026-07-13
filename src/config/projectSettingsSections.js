export const PROJECT_SETTING_SECTIONS = [
  {
    id: 'general',
    label: 'General',
    description: 'Project identity and management',
  },
  {
    id: 'shortHooks',
    label: 'Shorts Hooks',
    description: 'Hook categories and preset phrases',
  },
  {
    id: 'titles',
    label: 'Titles',
    description: 'Title templates and formatting',
  },
  {
    id: 'descriptions',
    label: 'Descriptions',
    description: 'Description layouts, blocks, and text pools',
  },
  {
    id: 'links',
    label: 'Links',
    description: 'Channel and support links used in descriptions',
  },
  {
    id: 'blocks',
    label: 'Blocks',
    description: 'List and text blocks used in descriptions',
  },
  {
    id: 'thumbnails',
    label: 'Thumbnail Templates',
    description: 'Thumbnail words, fallbacks, and patterns',
  },
  {
    id: 'hashtags',
    label: 'Hashtags & YouTube Tags',
    description: 'Project-level metadata tags',
  },
  {
    id: 'todo',
    label: 'Todo Settings',
    description: 'Todo statuses and workflow settings',
  },
  {
    id: 'shortsQueue',
    label: 'Shorts Queue',
    description: 'Queue length and duplicate spacing',
  },
];

export function getProjectSettingsSectionSummary(sectionId, projectConfig) {
  if (sectionId === 'general') {
    return projectConfig.name || 'Unnamed project';
  }

  if (sectionId === 'shortHooks') {
    return `${Object.keys(projectConfig.shortHookTypes || {}).length} hook groups`;
  }

  if (sectionId === 'titles') {
    return `${Object.keys(projectConfig.title?.templates || {}).length} template groups`;
  }

  if (sectionId === 'descriptions') {
    const longLayoutCount =
      projectConfig.description?.templates?.long?.layout?.length || 0;
    const shortsLayoutCount =
      projectConfig.description?.templates?.shorts?.layout?.length || 0;

    return `${longLayoutCount} long blocks, ${shortsLayoutCount} shorts blocks`;
  }

  if (sectionId === 'links') {
    return `${Object.keys(projectConfig.description?.links || {}).length} links`;
  }

  if (sectionId === 'blocks') {
    const long = projectConfig.description?.templates?.long || {};
    const customBlocks = long.customBlocks || {};
    const listCount = Object.values(customBlocks).filter(
      (b) => b && typeof b === 'object' && Array.isArray(b.items),
    ).length + (long.supportBlock ? 1 : 0);
    const textCount = Object.values(customBlocks).filter(
      (b) => typeof b === 'string',
    ).length;
    return `${listCount} list, ${textCount} text`;
  }

  if (sectionId === 'thumbnails') {
    const wordsCount = projectConfig.thumbnail?.words?.length || 0;
    const fallbackCount = projectConfig.thumbnail?.fallbacks?.length || 0;

    return `${wordsCount} words, ${fallbackCount} fallbacks`;
  }

  if (sectionId === 'hashtags') {
    const hashtagCount = projectConfig.hashtags?.base?.length || 0;
    const youtubeTagCount = projectConfig.youtubetags?.base?.length || 0;

    return `${hashtagCount} hashtags, ${youtubeTagCount} YouTube tags`;
  }

  if (sectionId === 'todo') {
    return `${projectConfig.todoStatuses?.length || 0} statuses`;
  }

  if (sectionId === 'shortsQueue') {
    const length = projectConfig.shortsQueue?.length ?? 20;
    const spacing = projectConfig.shortsQueue?.duplicateSpacing ?? 2;

    return `${length} covers, spacing ${spacing}`;
  }

  return '';
}
