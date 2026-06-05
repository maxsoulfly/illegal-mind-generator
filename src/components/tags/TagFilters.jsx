export default function TagFilters({
  filterMode,
  setFilterMode,
  counts,
  categoryFilter,
  setCategoryFilter,
  categories,
}) {
  return (
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

      <select
        className="form-select category-select"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="all">All categories</option>

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
