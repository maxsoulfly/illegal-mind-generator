import { useState } from 'react';

import { buildTagExplorerData } from '../utils/buildTagExplorerData';
import TagCard from '../components/tags/TagCard';
import TagControls from '../components/tags/TagControls';

export default function TagLibraryPage({
  projectConfig,
  savedEntries,
  projectName,
}) {
  const [sortMode, setSortMode] = useState('usage-desc');
  const [filterMode, setFilterMode] = useState('all');
  const [search, setSearch] = useState('');

  const tagData = buildTagExplorerData(projectConfig, savedEntries);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredTags = tagData.filter((tag) => {
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

  return (
    <main>
      <h1 className="app-title">
        Tag Library — <span className="project-name">{projectName}</span>
      </h1>

      <TagControls
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        search={search}
        setSearch={setSearch}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />

      <div className="tag-library">
        {sortedTags.map((tag) => (
          <TagCard key={tag.name} tag={tag} />
        ))}
      </div>
    </main>
  );
}
