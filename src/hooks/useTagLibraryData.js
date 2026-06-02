import { useMemo } from 'react';

import { buildTagExplorerData } from '../utils/buildTagExplorerData';
import { getTagCategories } from '../utils/tagRegistry';

export default function useTagLibraryData({
  projectConfig,
  savedEntries,
  projectOverrides,
  categoryFilter,
  filterMode,
  search,
  sortMode,
}) {
  return useMemo(() => {
    const tagData = buildTagExplorerData(
      projectConfig,
      savedEntries,
      projectOverrides,
    );

    const categories = getTagCategories(projectConfig);

    const categoryFilteredTags = tagData.filter((tag) => {
      if (categoryFilter === 'all') return true;
      return tag.category === categoryFilter;
    });

    const counts = {
      all: categoryFilteredTags.length,
      used: categoryFilteredTags.filter((tag) => tag.usageCount > 0).length,
      unused: categoryFilteredTags.filter((tag) => tag.isUnused).length,
      issues: categoryFilteredTags.filter((tag) => tag.hasMissingMappings)
        .length,
    };

    const normalizedSearch = search.trim().toLowerCase();

    const filteredTags = categoryFilteredTags.filter((tag) => {
      if (filterMode === 'used' && tag.usageCount === 0) return false;
      if (filterMode === 'unused' && !tag.isUnused) return false;
      if (filterMode === 'issues' && !tag.hasMissingMappings) return false;

      if (normalizedSearch) {
        return tag.name.toLowerCase().includes(normalizedSearch);
      }

      return true;
    });

    const sortedTags = [...filteredTags].sort((a, b) => {
      if (sortMode === 'usage-desc') return b.usageCount - a.usageCount;
      if (sortMode === 'usage-asc') return a.usageCount - b.usageCount;
      if (sortMode === 'name') return a.name.localeCompare(b.name);

      if (sortMode === 'issues') {
        return Number(b.hasMissingMappings) - Number(a.hasMissingMappings);
      }

      return 0;
    });

    return {
      categories,
      counts,
      sortedTags,
    };
  }, [
    projectConfig,
    savedEntries,
    projectOverrides,
    categoryFilter,
    filterMode,
    search,
    sortMode,
  ]);
}
