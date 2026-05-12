export default function TagHeader({ tag }) {
  return (
    <div className="tag-card-header">
      <div>
        <h3>{tag.label}</h3>
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
