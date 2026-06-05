import TagActions from './TagActions';
import TagSyncControls from './TagSyncControls';
import TagFilters from './TagFilters';

export default function TagControls({
  filterMode,
  setFilterMode,
  search,
  setSearch,
  sortMode,
  setSortMode,
  counts,
  categoryFilter,
  setCategoryFilter,
  categories,
  onCreateTag,
  projects,
  syncTargetProjectId,
  setSyncTargetProjectId,
  onSyncTags,
}) {
  return (
    <div className="library-controls">
      <div className="tag-library-toolbar">
        <TagFilters
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          counts={counts}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
        <div className="tag-library-actions">
          <TagSyncControls
            projects={projects}
            syncTargetProjectId={syncTargetProjectId}
            setSyncTargetProjectId={setSyncTargetProjectId}
            onSyncTags={onSyncTags}
          />

          <TagActions onCreateTag={onCreateTag} />
        </div>
      </div>

      <div className="tag-search-row">
        <input
          type="text"
          className="form-input"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="usage-desc">Most used</option>
          <option value="usage-asc">Least used</option>
          <option value="name">A to Z</option>
          <option value="issues">Issues first</option>
        </select>
      </div>
    </div>
  );
}
