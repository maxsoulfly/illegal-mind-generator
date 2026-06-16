import MoveControls from '../../ui/MoveControls';
import IconButton from '../../ui/IconButton';

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
      <MoveControls
        disabledUp={index === 0}
        disabledDown={index === itemCount - 1}
        onMoveUp={() => onMove(index, -1)}
        onMoveDown={() => onMove(index, 1)}
      />
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
      <IconButton icon="×" title="Remove item" onClick={() => onRemove(index)} />
    </div>
  );
}
