import { useState } from 'react';
import FormSelect from '../../ui/FormSelect';
import PlaceholderField from '../../ui/PlaceholderField';
import BlockActions from './BlockActions';
import { SCOPE_OPTIONS, TARGET_OPTIONS } from '../../../utils/customBlocks';

function textOf(blockData) {
  return typeof blockData === 'string' ? blockData : blockData?.text ?? '';
}

export default function TextBlockEditor({
  label,
  blockData,
  defaultScope,
  defaultTarget,
  linkKeys = [],
  hasOverride,
  onSave,
  onReset,
  onDelete,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [block, setBlock] = useState(() => ({
    text: textOf(blockData),
    scope: (typeof blockData === 'object' && blockData?.scope) || defaultScope,
    target: (typeof blockData === 'object' && blockData?.target) || defaultTarget,
    isCore: (typeof blockData === 'object' && blockData?.isCore) || false,
  }));
  const { text, scope, target, isCore } = block;

  function save(next) {
    setBlock(next);
    onSave({
      name: typeof blockData === 'object' ? blockData?.name : undefined,
      text: next.text,
      scope: next.scope,
      target: next.target,
      isCore: next.isCore,
    });
  }

  function handleToggleCore() {
    save({ ...block, isCore: !isCore });
  }

  function handleDelete() {
    if (isCore) return;
    if (window.confirm(`Delete "${label}"? This cannot be undone.`)) {
      onDelete();
    }
  }

  function handleTextBlur(nextText) {
    save({ ...block, text: nextText });
  }

  const placeholders = [
    '{artist}',
    '{song}',
    '{tagLine}',
    ...linkKeys.map((key) => `{links.${key}}`),
  ];

  function handleScopeChange(next) {
    save({ ...block, scope: next });
  }

  function handleTargetChange(next) {
    save({ ...block, target: next });
  }

  return (
    <article className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          <h3 className="tag-card-toggle" onClick={() => setCollapsed((c) => !c)}>
            <span className="tag-card-collapse-icon">{collapsed ? '▶' : '▼'}</span>
            {label}
          </h3>
        </div>
        <div className="links-editor-badges">
          <FormSelect value={scope} onChange={handleScopeChange} options={SCOPE_OPTIONS} />
          <FormSelect value={target} onChange={handleTargetChange} options={TARGET_OPTIONS} />
          <BlockActions
            hasOverride={hasOverride}
            onReset={onReset}
            onDelete={onDelete ? handleDelete : undefined}
            isCore={isCore}
            onToggleCore={handleToggleCore}
          />
        </div>
      </header>

      {!collapsed && (
        <div className="tag-editor-section">
          <div className="form-group">
            <div className="form-label">Text</div>
            <PlaceholderField
              multiline
              defaultValue={text}
              onBlur={handleTextBlur}
              placeholders={placeholders}
              rows={4}
            />
          </div>
        </div>
      )}
    </article>
  );
}
