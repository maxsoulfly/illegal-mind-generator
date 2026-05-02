export default function TagControls({
  filterMode,
  setFilterMode,
  search,
  setSearch,
  sortMode,
  setSortMode,
  counts,
}) {
  return (
    <div className="library-controls">
      <div className="tag-filters">
        <button
          className={filterMode === 'all' ? 'active' : ''}
          onClick={() => setFilterMode('all')}
        >
          All ({counts.all})
        </button>

        <button
          className={filterMode === 'used' ? 'active' : ''}
          onClick={() => setFilterMode('used')}
        >
          Used ({counts.used})
        </button>

        <button
          className={filterMode === 'unused' ? 'active' : ''}
          onClick={() => setFilterMode('unused')}
        >
          Unused ({counts.unused})
        </button>

        <button
          className={filterMode === 'issues' ? 'active' : ''}
          onClick={() => setFilterMode('issues')}
        >
          Issues ({counts.issues})
        </button>
      </div>
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
        <option value="name">A → Z</option>
        <option value="issues">Issues first</option>
      </select>
    </div>
  );
}
