export default function BlockInfoCard({ label, subtitle, onRemove }) {
  return (
    <article className="tag-card">
      <header className="tag-card-header">
        <h3>{label}</h3>
        {onRemove && (
          <button
            type="button"
            className="tag-reset-button"
            title="Remove from layout"
            onClick={onRemove}
          >
            ×
          </button>
        )}
        {subtitle && <span className="tag-status">{subtitle}</span>}
      </header>
    </article>
  );
}
