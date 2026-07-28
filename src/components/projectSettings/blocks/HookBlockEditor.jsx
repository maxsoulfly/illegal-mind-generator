import BlockEditorCard from './BlockEditorCard';
import HookTemplateEditor from '../../ui/HookTemplateEditor';

const OVERRIDE_TYPE_OPTIONS = [
  { value: 'textarea', label: 'Textarea' },
  { value: 'one-line', label: 'One-line' },
];

// Presentational editor for a single hook block entry in the Blocks → Hook
// Blocks tab — wraps BlockEditorCard with the lines slider/max input and
// (for song-scoped blocks) the override-type select, plus the template list.
export default function HookBlockEditor({
  label,
  templates,
  scope,
  target,
  overrideType,
  hasOverride,
  maxLines,
  countValue,
  onUpdateTemplates,
  onReset,
  onDelete,
  isCore,
  onToggleCore,
  onRename,
  onScopeChange,
  onTargetChange,
  onOverrideTypeChange,
  onMaxLinesChange,
  onCountChange,
  open,
  highlightText,
  placeholders,
}) {
  const pct =
    maxLines > 1 ? `${((countValue - 1) / (maxLines - 1)) * 100}%` : '0%';

  return (
    <BlockEditorCard
      label={label}
      badge={`${templates.length} templates`}
      scope={scope}
      target={target}
      onScopeChange={onScopeChange}
      onTargetChange={onTargetChange}
      hasOverride={hasOverride}
      onReset={onReset}
      onDelete={onDelete}
      isCore={isCore}
      onToggleCore={onToggleCore}
      onRename={onRename}
      open={open}
    >
      <div className="tag-phrase-row hook-block-lines-row">
        {scope === 'song' && (
          <>
            <span className="form-label">Override</span>
            <select
              className="form-select"
              style={{ flex: '0 0 auto', width: 'auto' }}
              value={overrideType}
              onChange={(e) => onOverrideTypeChange(e.target.value)}
            >
              {OVERRIDE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </>
        )}
        {maxLines > 1 && <span className="form-label">Lines</span>}
        {maxLines > 1 ? (
          <input
            type="range"
            min={1}
            max={maxLines}
            value={countValue}
            style={{ '--val': pct }}
            onChange={(e) => onCountChange(Number(e.target.value))}
          />
        ) : (
          <span className="hook-block-lines-empty" />
        )}
        {maxLines > 1 && (
          <span className="tag-status">{countValue}</span>
        )}
        <label className="hook-block-max-label">
          max
          <input
            key={maxLines}
            type="number"
            min="1"
            className="form-input hook-block-max-input"
            defaultValue={maxLines}
            onBlur={(e) =>
              onMaxLinesChange(
                Math.max(1, parseInt(e.target.value, 10) || 1),
              )
            }
          />
        </label>
      </div>
      <HookTemplateEditor
        templates={templates}
        onUpdateTemplates={onUpdateTemplates}
        highlightText={highlightText}
        placeholders={placeholders}
        noWrapper
      />
    </BlockEditorCard>
  );
}
