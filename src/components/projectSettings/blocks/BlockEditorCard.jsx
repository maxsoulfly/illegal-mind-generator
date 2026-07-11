import { useEffect, useRef, useState } from 'react';
import FormSelect from '../../ui/FormSelect';
import BlockActions from './BlockActions';
import IconButton from '../../ui/IconButton';
import { SCOPE_OPTIONS, TARGET_OPTIONS } from '../../../utils/customBlocks';

export default function BlockEditorCard({
  label,
  badge,
  scope,
  target,
  onScopeChange,
  onTargetChange,
  hasOverride,
  onReset,
  onDelete,
  isCore,
  onToggleCore,
  onRename,
  open,
  children,
}) {
  const [collapsed, setCollapsed] = useState(!open);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [open]);

  function startRename() {
    setRenameValue(label);
    setIsRenaming(true);
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== label) onRename(trimmed);
    setIsRenaming(false);
  }

  function handleRenameKey(e) {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') setIsRenaming(false);
  }

  return (
    <article ref={ref} className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          {isRenaming ? (
            <input
              className="tag-card-rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKey}
              autoFocus
            />
          ) : (
            <h3
              className="tag-card-toggle"
              onClick={() => setCollapsed((c) => !c)}
            >
              <span className="tag-card-collapse-icon">
                {collapsed ? '+' : '−'}
              </span>
              {label}
            </h3>
          )}
          {!isRenaming && onRename && (
            <IconButton icon="✏" title="Rename" onClick={startRename} stopPropagation />
          )}
          {badge && <span className="tag-status">{badge}</span>}
        </div>
        <div className="links-editor-badges">
          {onScopeChange && (
            <FormSelect
              value={scope}
              onChange={onScopeChange}
              options={SCOPE_OPTIONS}
            />
          )}
          {onTargetChange && (
            <FormSelect
              value={target}
              onChange={onTargetChange}
              options={TARGET_OPTIONS}
            />
          )}
          <BlockActions
            hasOverride={hasOverride}
            onReset={onReset}
            onDelete={onDelete}
            isCore={isCore}
            onToggleCore={onToggleCore}
          />
        </div>
      </header>

      {!collapsed && (
        <div className="tag-editor-section">{children}</div>
      )}
    </article>
  );
}
