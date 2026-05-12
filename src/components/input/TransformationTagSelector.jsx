export default function TransformationTagSelector({
  visibleTags,
  tagUsage,
  formData,
  onTagToggle,
}) {
  return (
    <div className="form-group">
      <label className="form-label">Transformation Tags</label>

      <div className="tag-list">
        {visibleTags
          .sort(
            ([tagA], [tagB]) => (tagUsage[tagB] || 0) - (tagUsage[tagA] || 0),
          )
          .map(([tag, tagData]) => {
            const isActive = (formData.transformationTags || []).includes(tag);

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
          })}
      </div>
    </div>
  );
}
