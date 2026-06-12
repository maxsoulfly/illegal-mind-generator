import { useState } from 'react';
import HookTemplateEditor from './HookTemplateEditor';

export default function TemplateGroupCard({
  label,
  templates = [],
  onUpdateTemplates,
  onReset,
  onRemove,
  highlightText,
  subtitle,
  countLabel = 'templates',
  initialCollapsed = false,
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <article className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <h3 className="tag-card-toggle" onClick={() => setCollapsed((c) => !c)}>
          <span className="tag-card-collapse-icon">{collapsed ? '▶' : '▼'}</span>
          {label}
        </h3>
        <button
          type="button"
          className="tag-reset-button"
          title="Reset to defaults"
          onClick={onReset}
        >
          ↺
        </button>
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
      </header>

      {!collapsed && (
        <>
          <span className="tag-status">{templates.length} {countLabel}</span>
          {subtitle && <p className="tag-category">{subtitle}</p>}
          <HookTemplateEditor
            templates={templates}
            onUpdateTemplates={onUpdateTemplates}
            highlightText={highlightText}
          />
        </>
      )}
    </article>
  );
}
