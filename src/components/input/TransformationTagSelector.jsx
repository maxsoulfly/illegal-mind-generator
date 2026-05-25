import { useState } from 'react';

export default function TransformationTagSelector({
  visibleTags,
  tagUsage,
  formData,
  onTagToggle,
  defaultVisibleTagLimit = 6,
}) {
  const [search, setSearch] = useState('');

  const selectedTagNames = formData.transformationTags || [];
  const normalizedSearch = search.trim().toLowerCase();

  const sortedTags = [...visibleTags].sort(
    ([tagA], [tagB]) => (tagUsage[tagB] || 0) - (tagUsage[tagA] || 0),
  );

  const selectedTags = sortedTags.filter(([tag]) =>
    selectedTagNames.includes(tag),
  );

  const availableTags = sortedTags.filter(([tag, tagData]) => {
    if (selectedTagNames.includes(tag)) return false;

    if (!normalizedSearch) return true;

    const label = tagData.label || tag;

    return (
      tag.toLowerCase().includes(normalizedSearch) ||
      label.toLowerCase().includes(normalizedSearch)
    );
  });

  const visibleAvailableTags = normalizedSearch
    ? availableTags
    : availableTags.slice(0, defaultVisibleTagLimit);

  const renderTagButton = ([tag, tagData]) => {
    const isActive = selectedTagNames.includes(tag);

    return (
      <button
        key={tag}
        type="button"
        className={isActive ? 'tag-chip active' : 'tag-chip'}
        onClick={() => onTagToggle(tag)}
      >
        {tagData.label || tag} ({tagUsage[tag] || 0})
      </button>
    );
  };

  return (
    <div className="form-group">
      <details className="tag-section tag-selector-details" open>
        <summary>Transformation Tags</summary>

        <input
          className="form-input"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tags..."
        />

        {selectedTags.length > 0 && (
          <div className="tag-selector-group">
            <p className="tag-selector-label">Selected</p>
            <div className="tag-list">{selectedTags.map(renderTagButton)}</div>
          </div>
        )}

        <div className="tag-selector-group">
          <p className="tag-selector-label">
            {normalizedSearch
              ? `Matching Tags (${visibleAvailableTags.length})`
              : `Available Tags (${visibleAvailableTags.length} of ${availableTags.length})`}
          </p>

          <div className="tag-list">
            {visibleAvailableTags.map(renderTagButton)}
          </div>
        </div>
      </details>
    </div>
  );
}
