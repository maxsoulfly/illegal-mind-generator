import { useState } from 'react';

import useTagLibraryData from '../hooks/useTagLibraryData';

import TagCard from '../components/tags/TagCard';
import TagControls from '../components/tags/TagControls';

export default function TagLibraryPage({
  projectId,
  projects,
  projectConfig,
  savedEntries,
  projectName,
  projectOverrides,
  updateTagOverride,
  resetTagOverride,
  syncProjectTags,
  onLoadEntry,
}) {
  const [sortMode, setSortMode] = useState('usage-desc');
  const [filterMode, setFilterMode] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const destinationProjects = Object.entries(projects || {}).filter(
    ([destinationProjectId]) => destinationProjectId !== projectId,
  );

  const [syncTargetProjectId, setSyncTargetProjectId] = useState(
    destinationProjects[0]?.[0] || '',
  );

  const handleToggleTagVisibility = (tagName, currentVisible) => {
    updateTagOverride(tagName, {
      visible: !currentVisible,
    });
  };

  const handleUpdateTag = (tagName, updates) => {
    updateTagOverride(tagName, updates);
  };

  const handleCreateTag = () => {
    const rawName = window.prompt('New tag name');

    if (!rawName) return;

    const tagName = rawName.trim().toLowerCase();

    if (!tagName) return;

    updateTagOverride(tagName, {
      label: rawName.trim(),
      category: 'custom',
      visible: true,
      title: [],
      thumbnail: [],
      description: {
        technical: [],
        log: [],
        status: [],
      },
      isCustom: true,
    });
  };

  // Build filtered and sorted tag data for the current project.
  const { categories, counts, sortedTags } = useTagLibraryData({
    projectConfig,
    savedEntries,
    projectOverrides,
    categoryFilter,
    filterMode,
    search,
    sortMode,
  });

  const handleSyncTags = () => {
    if (!syncTargetProjectId) return;

    syncProjectTags({
      sourceProjectId: projectId,
      targetProjectId: syncTargetProjectId,
      sourceTags: projectConfig.tags,
      targetBaseTags: projects[syncTargetProjectId]?.tags || {},
    });

    window.alert(`Tags synced to ${projects[syncTargetProjectId]?.name}.`);
  };

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
        counts={counts}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        onCreateTag={handleCreateTag}
        projects={destinationProjects}
        syncTargetProjectId={syncTargetProjectId}
        setSyncTargetProjectId={setSyncTargetProjectId}
        onSyncTags={handleSyncTags}
      />

      <div className="tag-library">
        {sortedTags.map((tag) => (
          <TagCard
            key={tag.name}
            tag={tag}
            categories={categories}
            onToggleVisibility={handleToggleTagVisibility}
            onUpdateTag={handleUpdateTag}
            projectOverrides={projectOverrides}
            resetTagOverride={resetTagOverride}
            onLoadEntry={onLoadEntry}
          />
        ))}
      </div>
    </main>
  );
}
