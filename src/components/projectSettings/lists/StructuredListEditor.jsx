import { useState } from 'react';

import PillSelect from '../../ui/PillSelect';
import ListItemRow from './ListItemRow';
import ListBlockActions from './ListBlockActions';

const SCOPE_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'song', label: 'Song' },
];

const TARGET_OPTIONS = [
  { value: 'long', label: 'Long' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'both', label: 'Long + Shorts' },
];

function detectItemType(blockData) {
  if (blockData?.itemType === 'text' || blockData?.itemType === 'link') {
    return blockData.itemType;
  }

  return (blockData?.items ?? []).some((item) => 'link' in item)
    ? 'link'
    : 'text';
}

export default function StructuredListEditor({
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
  const linkSuggestionsId = `link-suggestions-${label.replace(/\s+/g, '-')}`;
  const [title, setTitle] = useState(blockData?.title ?? '');
  const [scope, setScope] = useState(blockData?.scope ?? defaultScope);
  const [target, setTarget] = useState(blockData?.target ?? defaultTarget);
  const [isCore, setIsCore] = useState(blockData?.isCore ?? false);
  const [items, setItems] = useState(() =>
    (blockData?.items ?? []).map((item, i) => ({ ...item, _id: i })),
  );

  const itemType = detectItemType(blockData);
  const valueLabel = itemType === 'link' ? 'Link' : 'Text';

  const scopeLabel = scope === 'song' ? 'Song' : 'Project';
  const targetLabel =
    target === 'both' ? 'Long + Shorts' : target === 'shorts' ? 'Shorts' : 'Long';

  function save(nextTitle, nextItems, nextScope, nextTarget, nextIsCore = isCore) {
    onSave({
      name: blockData?.name,
      itemType: blockData?.itemType,
      title: nextTitle,
      items: nextItems.map(({ _id, ...item }) => item),
      scope: nextScope,
      target: nextTarget,
      isCore: nextIsCore,
    });
  }

  function handleToggleCore() {
    const next = !isCore;
    setIsCore(next);
    save(title, items, scope, target, next);
  }

  function handleDelete() {
    if (isCore) return;
    if (window.confirm(`Delete "${label}"? This cannot be undone.`)) {
      onDelete();
    }
  }

  function handleTitleBlur(e) {
    const next = e.target.value;
    setTitle(next);
    save(next, items, scope, target);
  }

  function handleScopeChange(next) {
    setScope(next);
    save(title, items, next, target);
  }

  function handleTargetChange(next) {
    setTarget(next);
    save(title, items, scope, next);
  }

  function handleItemBlur(index, field, value) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setItems(next);
    save(title, next, scope, target);
  }

  function handleAdd() {
    const newItem =
      itemType === 'link' ? { label: '', link: '' } : { label: '', text: '' };
    const next = [...items, { ...newItem, _id: Date.now() }];
    setItems(next);
    save(title, next, scope, target);
  }

  function handleRemove(index) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    save(title, next, scope, target);
  }

  function handleMove(index, direction) {
    const next = [...items];
    next.splice(index, 1);
    next.splice(index + direction, 0, items[index]);
    setItems(next);
    save(title, next, scope, target);
  }

  function handleSort() {
    const next = [...items].sort((a, b) =>
      (a.label ?? '').localeCompare(b.label ?? ''),
    );
    setItems(next);
    save(title, next, scope, target);
  }

  return (
    <article className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          <h3 className="tag-card-toggle" onClick={() => setCollapsed((c) => !c)}>
            <span className="tag-card-collapse-icon">{collapsed ? '▶' : '▼'}</span>
            {label}
          </h3>
          <span className="tag-status">{items.length} items</span>
        </div>
        <div className="links-editor-badges">
          {collapsed ? (
            <>
              <span className="links-editor-badge">{scopeLabel}</span>
              <span className="links-editor-badge">{targetLabel}</span>
            </>
          ) : (
            <>
              <PillSelect
                value={scope}
                onChange={handleScopeChange}
                options={SCOPE_OPTIONS}
              />
              <PillSelect
                value={target}
                onChange={handleTargetChange}
                options={TARGET_OPTIONS}
              />
            </>
          )}
          <ListBlockActions
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
            <div className="form-label">Block Title</div>
            <input
              className="form-input"
              defaultValue={title}
              onBlur={handleTitleBlur}
            />
          </div>

          <div className="form-group">
            <div className="links-editor-row links-editor-row--header">
              <span />
              <span className="form-label">Label</span>
              <span className="form-label">{valueLabel}</span>
              <span />
            </div>
            {items.map((item, i) => (
              <ListItemRow
                key={item._id}
                item={item}
                index={i}
                itemCount={items.length}
                itemType={itemType}
                valueLabel={valueLabel}
                linkSuggestionsId={linkSuggestionsId}
                onMove={handleMove}
                onBlurField={handleItemBlur}
                onRemove={handleRemove}
              />
            ))}
            {itemType === 'link' && (
              <datalist id={linkSuggestionsId}>
                {linkKeys.map((key) => (
                  <option key={key} value={`{links.${key}}`} />
                ))}
              </datalist>
            )}
            <div className="button-row">
              <button type="button" className="button-secondary" onClick={handleAdd}>
                + Add
              </button>
              <button type="button" className="button-secondary" onClick={handleSort}>
                Sort A–Z
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
