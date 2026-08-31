import { useState } from 'react';

import useTagLibraryData from '../hooks/useTagLibraryData';

import TagCard from '../components/tags/TagCard';
import TagControls from '../components/tags/TagControls';
import AddTagPanel from '../components/tags/AddTagPanel';

export default function TagLibraryPage({
  projectId,
  projects,
  projectConfig,
  savedEntries,
  projectOverrides,
  updateTagOverride,
  resetTagOverride,
  syncProjectTags,
  copyTagFromProject,
  onLoadEntry,
  searchTarget,
  clearSearchTarget,
  showToast,
}) {
  const [sortMode, setSortMode] = useState('usage-desc');
  const [filterMode, setFilterMode] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddTagPanel, setShowAddTagPanel] = useState(false);
  const destinationProjects = Object.entries(projects || {}).filter(
    ([destinationProjectId]) => destinationProjectId !== projectId,
  );

  const [syncTargetProjectId, setSyncTargetProjectId] = useState(
    destinationProjects[0]?.[0] || '',
  );

  const activeSearch = searchTarget?.tagName || search;
  const activeFilterMode = searchTarget ? 'all' : filterMode;
  const activeCategoryFilter = searchTarget ? 'all' : categoryFilter;

  const handleSetSearch = (nextSearch) => {
    clearSearchTarget?.();
    setSearch(nextSearch);
  };

  const handleSetFilterMode = (nextFilterMode) => {
    clearSearchTarget?.();
    setFilterMode(nextFilterMode);
  };

  const handleSetCategoryFilter = (nextCategoryFilter) => {
    clearSearchTarget?.();
    setCategoryFilter(nextCategoryFilter);
  };

  const handleToggleTagVisibility = (tagName, currentVisible) => {
    updateTagOverride(tagName, {
      visible: !currentVisible,
    });
  };

  const handleUpdateTag = (tagName, updates) => {
    updateTagOverride(tagName, updates);
  };

  const handleDuplicateTag = (tag) => {
    const newName = tag.name + '_copy';
    updateTagOverride(newName, {
      label: tag.label + ' Copy',
      category: tag.category,
      excludeFromHashtags: Boolean(tag.excludeFromHashtags),
      excludeFromButIts: Boolean(tag.excludeFromButIts),
      visible: true,
      title: [],
      thumbnail: [],
      hashtags: [],
      description: { technical: [], log: [], status: [] },
      isCustom: true,
    });
  };

  const handleCreateTag = (tagName, overrideObject) => {
    updateTagOverride(tagName, overrideObject);
  };

  // Build filtered and sorted tag data for the current project.
  const { categories, counts, sortedTags } = useTagLibraryData({
    projectConfig,
    savedEntries,
    projectOverrides,
    categoryFilter: activeCategoryFilter,
    filterMode: activeFilterMode,
    search: activeSearch,
    sortMode,
  });

  // Sync/Copy now run their Set-union merge server-side (base tags read from
  // projects.json there), so no *BaseTags args are passed. Both are async —
  // await before the success toast, and surface failures rather than lying.
  const handleSyncTags = async () => {
    if (!syncTargetProjectId) return;

    try {
      await syncProjectTags({
        sourceProjectId: projectId,
        targetProjectId: syncTargetProjectId,
      });
      showToast(`Tags synced to ${projects[syncTargetProjectId]?.name}.`);
    } catch {
      showToast('Sync failed — check the connection and try again.');
    }
  };

  const handleCopyTagFromProject = async (tagName, sourceProjectId) => {
    try {
      await copyTagFromProject({
        tagName,
        sourceProjectId,
        targetProjectId: projectId,
      });
      showToast(`Copied "${tagName}" from ${projects[sourceProjectId]?.name}.`);
    } catch {
      showToast(`Copy failed — check the connection and try again.`);
    }
  };

  return (
    <main>
      <TagControls
        filterMode={activeFilterMode}
        setFilterMode={handleSetFilterMode}
        search={activeSearch}
        setSearch={handleSetSearch}
        sortMode={sortMode}
        setSortMode={setSortMode}
        counts={counts}
        categoryFilter={activeCategoryFilter}
        setCategoryFilter={handleSetCategoryFilter}
        categories={categories}
        onCreateTag={() => setShowAddTagPanel(true)}
        projects={destinationProjects}
        syncTargetProjectId={syncTargetProjectId}
        setSyncTargetProjectId={setSyncTargetProjectId}
        onSyncTags={handleSyncTags}
      />

      {showAddTagPanel && (
        <AddTagPanel
          projectConfig={projectConfig}
          onCreate={handleCreateTag}
          onClose={() => setShowAddTagPanel(false)}
        />
      )}

      <div className="tag-library tag-library--3col">
        {sortedTags.map((tag) => (
          <TagCard
            key={tag.name}
            tag={tag}
            categories={categories}
            onToggleVisibility={handleToggleTagVisibility}
            onUpdateTag={handleUpdateTag}
            onDuplicateTag={handleDuplicateTag}
            projectOverrides={projectOverrides}
            resetTagOverride={resetTagOverride}
            onLoadEntry={onLoadEntry}
            sourceTarget={searchTarget}
            projectConfig={projectConfig}
            otherProjects={destinationProjects}
            onCopyTagFromProject={handleCopyTagFromProject}
          />
        ))}
      </div>
    </main>
  );
}
