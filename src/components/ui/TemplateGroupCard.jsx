import { useState } from 'react';
import HookTemplateEditor from './HookTemplateEditor';
import LabelSliderRow from './LabelSliderRow';

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
  sliderConfig,
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <article className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          <h3 className="tag-card-toggle" onClick={() => setCollapsed((c) => !c)}>
            <span className="tag-card-collapse-icon">{collapsed ? '▶' : '▼'}</span>
            {label}
          </h3>
          <button
            type="button"
            className="tag-reset-button"
            title="Reset to defaults"
            onClick={(e) => { e.stopPropagation(); onReset(); }}
          >
            ↺
          </button>
        </div>
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
          {sliderConfig && (
            <LabelSliderRow
              label={sliderConfig.label}
              min={sliderConfig.min}
              max={sliderConfig.max}
              value={sliderConfig.value}
              onChange={sliderConfig.onChange}
            />
          )}
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
