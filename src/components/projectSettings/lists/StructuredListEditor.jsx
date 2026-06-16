import { useState } from 'react';

import FormSelect from '../../ui/FormSelect';
import IconButton from '../../ui/IconButton';
import ListItemRow from './ListItemRow';
import BlockActions from '../blocks/BlockActions';

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
  const [block, setBlock] = useState(() => ({
    title: blockData?.title ?? '',
    scope: blockData?.scope ?? defaultScope,
    target: blockData?.target ?? defaultTarget,
    isCore: blockData?.isCore ?? false,
    items: (blockData?.items ?? []).map((item, i) => ({ ...item, _id: i })),
  }));
  const { title, scope, target, isCore, items } = block;

  const itemType = detectItemType(blockData);
  const valueLabel = itemType === 'link' ? 'Link' : 'Text';

  function save(next) {
    setBlock(next);
    onSave({
      name: blockData?.name,
      itemType: blockData?.itemType,
      title: next.title,
      items: next.items.map((item) => {
        const persisted = { ...item };
        delete persisted._id;
        return persisted;
      }),
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

  function handleTitleBlur(e) {
    save({ ...block, title: e.target.value });
  }

  function handleScopeChange(next) {
    save({ ...block, scope: next });
  }

  function handleTargetChange(next) {
    save({ ...block, target: next });
  }

  function handleItemBlur(index, field, value) {
    save({
      ...block,
      items: items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function handleAdd() {
    const newItem =
      itemType === 'link' ? { label: '', link: '' } : { label: '', text: '' };
    save({ ...block, items: [...items, { ...newItem, _id: Date.now() }] });
  }

  function handleRemove(index) {
    save({ ...block, items: items.filter((_, i) => i !== index) });
  }

  function handleMove(index, direction) {
    const next = [...items];
    next.splice(index, 1);
    next.splice(index + direction, 0, items[index]);
    save({ ...block, items: next });
  }

  function handleSort() {
    const next = [...items].sort((a, b) =>
      (a.label ?? '').localeCompare(b.label ?? ''),
    );
    save({ ...block, items: next });
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
          <FormSelect
            value={scope}
            onChange={handleScopeChange}
            options={SCOPE_OPTIONS}
          />
          <FormSelect
            value={target}
            onChange={handleTargetChange}
            options={TARGET_OPTIONS}
          />
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
              <IconButton icon="+ Add" className="button-secondary" onClick={handleAdd} />
              <IconButton icon="Sort A–Z" className="button-secondary" onClick={handleSort} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
