import { useState } from 'react';
import HookTemplateEditor from './HookTemplateEditor';
import LabelSliderRow from './LabelSliderRow';
import IconButton from './IconButton';

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
  children,
  headerActions,
  placeholders,
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
          {onReset && (
            <IconButton
              icon="↺"
              title="Reset to defaults"
              stopPropagation
              onClick={onReset}
            />
          )}
          {headerActions}
        </div>
        {onRemove && (
          <IconButton icon="×" title="Remove from layout" onClick={onRemove} />
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
          {onUpdateTemplates && (
            <span className="tag-status">{templates.length} {countLabel}</span>
          )}
          {subtitle && <p className="tag-category">{subtitle}</p>}
          {children}
          {onUpdateTemplates && (
            <HookTemplateEditor
              templates={templates}
              onUpdateTemplates={onUpdateTemplates}
              highlightText={highlightText}
              placeholders={placeholders}
            />
          )}
        </>
      )}
    </article>
  );
}
