import { useState } from 'react';
import IconButton from './IconButton';

export default function BlockInfoCard({ label, subtitle, onRemove, collapsible = false, children }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <article className={`tag-card${collapsed || !collapsible ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <h3
          className={collapsible ? 'tag-card-toggle' : undefined}
          onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
        >
          {collapsible && (
            <span className="tag-card-collapse-icon">{collapsed ? '▶' : '▼'}</span>
          )}
          {label}
        </h3>
        {onRemove && (
          <IconButton icon="×" title="Remove from layout" onClick={onRemove} />
        )}
        {subtitle && <span className="tag-status">{subtitle}</span>}
      </header>
      {collapsible && !collapsed && children}
    </article>
  );
}
