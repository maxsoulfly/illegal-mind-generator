// One row in a StructuredListEditor: move up/down, label input, value input
// (text or link, with optional datalist suggestions), remove button.
export default function ListItemRow({
  item,
  index,
  itemCount,
  itemType,
  valueLabel,
  linkSuggestionsId,
  onMove,
  onBlurField,
  onRemove,
}) {
  return (
    <div className="links-editor-row">
      <div className="list-item-move-controls">
        <button
          type="button"
          className="tag-reset-button"
          title="Move up"
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
        >↑</button>
        <button
          type="button"
          className="tag-reset-button"
          title="Move down"
          disabled={index === itemCount - 1}
          onClick={() => onMove(index, 1)}
        >↓</button>
      </div>
      <input
        className="form-input"
        defaultValue={item.label ?? ''}
        placeholder="Label"
        onBlur={(e) => onBlurField(index, 'label', e.target.value)}
      />
      <input
        className="form-input"
        defaultValue={item[itemType] ?? ''}
        placeholder={valueLabel}
        list={itemType === 'link' ? linkSuggestionsId : undefined}
        onBlur={(e) => onBlurField(index, itemType, e.target.value)}
      />
      <button
        type="button"
        className="tag-reset-button"
        title="Remove item"
        onClick={() => onRemove(index)}
      >×</button>
    </div>
  );
}
