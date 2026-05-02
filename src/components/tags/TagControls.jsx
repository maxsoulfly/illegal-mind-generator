export default function TagControls({
  filterMode,
  setFilterMode,
  search,
  setSearch,
  sortMode,
  setSortMode,
}) {
  return (
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
        <input
          type="text"
          className="form-input"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
  );
}
