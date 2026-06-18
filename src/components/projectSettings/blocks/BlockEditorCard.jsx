import { useEffect, useRef, useState } from 'react';
import FormSelect from '../../ui/FormSelect';
import BlockActions from './BlockActions';
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
  open,
  children,
}) {
  const [collapsed, setCollapsed] = useState(!open);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [open]);

  return (
    <article ref={ref} className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          <h3
            className="tag-card-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            <span className="tag-card-collapse-icon">
              {collapsed ? '▶' : '▼'}
            </span>
            {label}
          </h3>
          {badge && <span className="tag-status">{badge}</span>}
        </div>
        <div className="links-editor-badges">
          <FormSelect
            value={scope}
            onChange={onScopeChange}
            options={SCOPE_OPTIONS}
          />
          <FormSelect
            value={target}
            onChange={onTargetChange}
            options={TARGET_OPTIONS}
          />
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
