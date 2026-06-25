import IconButton from './IconButton';

export default function BlockInfoCard({ label, onRemove, onAdd, onNavigate }) {
  return (
    <article className="tag-card tag-card--collapsed">
      <header className="tag-card-header">
        <h3
          className={onNavigate ? 'tag-card-toggle' : undefined}
          onClick={onNavigate || undefined}
        >
          {label}
          {onNavigate && <span className="tag-card-nav-arrow"> →</span>}
        </h3>
        {onAdd && (
          <IconButton icon="+" title="Add to layout" onClick={onAdd} />
        )}
        {onRemove && (
          <IconButton icon="×" title="Remove from layout" onClick={onRemove} />
        )}
      </header>
    </article>
  );
}
