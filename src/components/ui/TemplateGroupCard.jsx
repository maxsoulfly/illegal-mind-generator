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

  // If a nav target highlights a row in this card, it needs to actually be
  // mounted/visible to scroll to — ignore manual collapse while that's true.
  const isCollapsed = collapsed && !highlightText;

  return (
    <article className={`tag-card${isCollapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          <h3 className="tag-card-toggle" onClick={() => setCollapsed((c) => !c)}>
            <span className="tag-card-collapse-icon">{isCollapsed ? '+' : '−'}</span>
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

      {!isCollapsed && (
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
