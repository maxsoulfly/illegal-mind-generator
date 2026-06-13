import { useState } from 'react';

function detectItemType(items = []) {
  return items.some((item) => 'link' in item) ? 'link' : 'text';
}

export default function StructuredListEditor({
  label,
  blockData,
  scope,
  target,
  hasOverride,
  onSave,
  onReset,
}) {
  const [title, setTitle] = useState(blockData?.title ?? '');
  const [items, setItems] = useState(() =>
    (blockData?.items ?? []).map((item, i) => ({ ...item, _id: i })),
  );

  const itemType = detectItemType(blockData?.items);
  const valueLabel = itemType === 'link' ? 'Link' : 'Text';

  const scopeLabel = scope === 'song' ? 'Song' : 'Project';
  const targetLabel =
    target === 'both' ? 'Long + Shorts' : target === 'shorts' ? 'Shorts' : 'Long';

  function save(nextTitle, nextItems) {
    onSave({
      title: nextTitle,
      items: nextItems.map(({ _id, ...item }) => item),
    });
  }

  function handleTitleBlur(e) {
    const next = e.target.value;
    setTitle(next);
    save(next, items);
  }

  function handleItemBlur(index, field, value) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setItems(next);
    save(title, next);
  }

  function handleAdd() {
    const newItem =
      itemType === 'link' ? { label: '', link: '' } : { label: '', text: '' };
    const next = [...items, { ...newItem, _id: Date.now() }];
    setItems(next);
    save(title, next);
  }

  function handleRemove(index) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    save(title, next);
  }

  return (
    <section className="tag-editor-section">
      <div className="tag-card-header">
        <h3 className="tag-card-title">{label}</h3>
        <div className="links-editor-badges">
          <span className="links-editor-badge">{scopeLabel}</span>
          <span className="links-editor-badge">{targetLabel}</span>
        </div>
        {hasOverride && (
          <button
            type="button"
            className="tag-reset-button"
            title="Reset to default"
            onClick={onReset}
          >
            ↺
          </button>
        )}
      </div>

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
    </section>
  );
}
