import { useState } from 'react';

import { buildTagExplorerData } from '../utils/buildTagExplorerData';
import TagCard from '../components/tags/TagCard';

export default function TagLibraryPage({
  projectConfig,
  savedEntries,
  projectName,
}) {
  const [sortMode, setSortMode] = useState('usage-desc');
  const [filterMode, setFilterMode] = useState('all');

  const tagData = buildTagExplorerData(projectConfig, savedEntries);

  const filteredTags = tagData.filter((tag) => {
    if (filterMode === 'all') return true;

    if (filterMode === 'used') return tag.usageCount > 0;

    if (filterMode === 'unused') return tag.isUnused;

    if (filterMode === 'issues') return tag.hasMissingMappings;

    return true;
  });

  const sortedTags = [...filteredTags].sort((a, b) => {
    if (sortMode === 'usage-desc') {
      return b.usageCount - a.usageCount;
    }

    if (sortMode === 'usage-asc') {
      return a.usageCount - b.usageCount;
    }

    if (sortMode === 'name') {
      return a.name.localeCompare(b.name);
    }

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
      <div className="library-controls">
        <div className="tag-filters">
          <button
            className={filterMode === 'all' ? 'active' : ''}
            onClick={() => setFilterMode('all')}
          >
            All
          </button>

          <button
            className={filterMode === 'used' ? 'active' : ''}
            onClick={() => setFilterMode('used')}
          >
            Used
          </button>

          <button
            className={filterMode === 'unused' ? 'active' : ''}
            onClick={() => setFilterMode('unused')}
          >
            Unused
          </button>

          <button
            className={filterMode === 'issues' ? 'active' : ''}
            onClick={() => setFilterMode('issues')}
          >
            Issues
          </button>
        </div>
        <select
          className="form-select"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="usage-desc">Most used</option>
          <option value="usage-asc">Least used</option>
          <option value="name">A → Z</option>
          <option value="issues">Issues first</option>
        </select>
      </div>

      <div className="tag-library">
        {sortedTags.map((tag) => (
          <TagCard key={tag.name} tag={tag} />
        ))}
      </div>
    </main>
  );
}
