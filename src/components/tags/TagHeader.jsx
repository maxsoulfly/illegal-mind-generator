export default function TagHeader({ tag, projectOverrides, resetTagOverride }) {
  const override = projectOverrides?.[tag.name];
  const isCustomTag = !!override?.isCustom;
  const hasResettableOverrides = !!override && !isCustomTag;

  const handleResetTag = () => {
    const shouldReset = window.confirm(
      `Reset "${tag.label}" to default tag settings?`,
    );

    if (!shouldReset) return;

    resetTagOverride(tag.name);
  };
  // console.log(tag.name, tag.isCustom, projectOverrides?.[tag.name]);
  return (
    <div className="tag-card-header">
      <div>
        <h3>
          {tag.label}
          {hasResettableOverrides && (
            <button
              type="button"
              className="tag-reset-button"
              onClick={handleResetTag}
              title="Reset tag edits"
            >
              ↺
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
