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
}) {
  return (
    <article className="tag-card">
      <header className="tag-card-header">
        <h3>{label}</h3>
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

      <span className="tag-status">{templates.length} {countLabel}</span>
      {subtitle && <p className="tag-category">{subtitle}</p>}

      <HookTemplateEditor
        templates={templates}
        onUpdateTemplates={onUpdateTemplates}
        highlightText={highlightText}
      />
    </article>
  );
}
