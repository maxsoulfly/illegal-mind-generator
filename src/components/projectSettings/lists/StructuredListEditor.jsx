import { useState } from 'react';

function detectItemType(items = []) {
  return items.some((item) => 'link' in item) ? 'link' : 'text';
}

export default function StructuredListEditor({
  label,
  blockData,
  defaultScope,
  defaultTarget,
  hasOverride,
  onSave,
  onReset,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [title, setTitle] = useState(blockData?.title ?? '');
  const [scope, setScope] = useState(blockData?.scope ?? defaultScope);
  const [target, setTarget] = useState(blockData?.target ?? defaultTarget);
  const [items, setItems] = useState(() =>
    (blockData?.items ?? []).map((item, i) => ({ ...item, _id: i })),
  );

  const itemType = detectItemType(blockData?.items);
  const valueLabel = itemType === 'link' ? 'Link' : 'Text';

  const scopeLabel = scope === 'song' ? 'Song' : 'Project';
  const targetLabel =
    target === 'both' ? 'Long + Shorts' : target === 'shorts' ? 'Shorts' : 'Long';

  function save(nextTitle, nextItems, nextScope, nextTarget) {
    onSave({
      title: nextTitle,
      items: nextItems.map(({ _id, ...item }) => item),
      scope: nextScope,
      target: nextTarget,
    });
  }

  function handleTitleBlur(e) {
    const next = e.target.value;
    setTitle(next);
    save(next, items, scope, target);
  }

  function handleScopeChange(e) {
    const next = e.target.value;
    setScope(next);
    save(title, items, next, target);
  }

  function handleTargetChange(e) {
    const next = e.target.value;
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

  return (
    <article className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          <h3 className="tag-card-toggle" onClick={() => setCollapsed((c) => !c)}>
            <span className="tag-card-collapse-icon">{collapsed ? '▶' : '▼'}</span>
            {label}
          </h3>
          {hasOverride && (
            <button
              type="button"
              className="tag-reset-button"
              title="Reset to default"
              onClick={(e) => { e.stopPropagation(); onReset(); }}
            >
              ↺
            </button>
          )}
        </div>
        <div className="links-editor-badges">
          {collapsed ? (
            <>
              <span className="links-editor-badge">{scopeLabel}</span>
              <span className="links-editor-badge">{targetLabel}</span>
            </>
          ) : (
            <>
              <select
                className="links-editor-badge-select"
                value={scope}
                onChange={handleScopeChange}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="project">Project</option>
                <option value="song">Song</option>
              </select>
              <select
                className="links-editor-badge-select"
                value={target}
                onChange={handleTargetChange}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="long">Long</option>
                <option value="shorts">Shorts</option>
                <option value="both">Long + Shorts</option>
              </select>
            </>
          )}
          <span className="tag-status">{items.length} items</span>
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
              <span className="form-label">Label</span>
              <span className="form-label">{valueLabel}</span>
              <span />
            </div>
            {items.map((item, i) => (
              <div key={item._id} className="links-editor-row">
                <input
                  className="form-input"
                  defaultValue={item.label ?? ''}
                  placeholder="Label"
                  onBlur={(e) => handleItemBlur(i, 'label', e.target.value)}
                />
                <input
                  className="form-input"
                  defaultValue={item[itemType] ?? ''}
                  placeholder={valueLabel}
                  onBlur={(e) => handleItemBlur(i, itemType, e.target.value)}
                />
                <button
                  type="button"
                  className="tag-reset-button"
                  title="Remove item"
                  onClick={() => handleRemove(i)}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="button-secondary" onClick={handleAdd}>
              + Add
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
