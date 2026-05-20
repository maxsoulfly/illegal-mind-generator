export default function TagHeader({ tag, projectOverrides, resetTagOverride }) {
  const override = projectOverrides?.[tag.name];
  const hasOverrides = !!override;
  const isCustomTag = !!override?.isCustom || !!tag.isCustom;

  const handleResetTag = () => {
    const message = isCustomTag
      ? `Delete custom tag "${tag.label}"?`
      : `Reset "${tag.label}" to default tag settings?`;

    const shouldContinue = window.confirm(message);

    if (!shouldContinue) return;

    resetTagOverride(tag.name);
  };
  console.log(tag.name, tag.isCustom, projectOverrides?.[tag.name]);
  return (
    <div className="tag-card-header">
      <div>
        <h3>
          {tag.label}
          {hasOverrides && (
            <button
              type="button"
              className="tag-reset-button"
              onClick={handleResetTag}
              title={tag.isCustom ? 'Delete custom tag' : 'Reset tag edits'}
            >
              {tag.isCustom ? '×' : '↺'}
            </button>
          )}
        </h3>
        <div className="tag-category">{tag.category}</div>
      </div>

      <span className="tag-usage">{tag.usageCount} saved</span>

      <span className="tag-status">
        {tag.hasMissingMappings ? 'Issue' : tag.isUnused ? 'Unused' : 'Used'}
      </span>

      {!tag.isVisible && <span className="tag-hidden">Hidden</span>}
    </div>
  );
}
