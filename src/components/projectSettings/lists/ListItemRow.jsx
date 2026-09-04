import { forwardRef } from 'react';

import MoveControls from '../../ui/MoveControls';
import IconButton from '../../ui/IconButton';
import { editableRowKeys } from '../../../utils/keyboard';

// One row in a StructuredListEditor: move up/down, label input, value input
// (text or link, with optional datalist suggestions), remove button.
// forwardRef + `highlighted` mirror PhraseRow's pattern, so a random-pick
// list block's winning item (source-navigated from a generated description)
// can be scrolled to and visually emphasized the same way phrase rows are.
//
// Opt-in keyboard behaviour for "+ Add"-style lists (both default off,
// mirrors PhraseRow): commitOnEnter blurs the focused <input> to commit via
// its existing onBlur; cancelBlankOnEscape removes the row (onRemove) ONLY
// while BOTH the label and value committed props are blank.
const ListItemRow = forwardRef(function ListItemRow({
  item,
  index,
  itemCount,
  itemType,
  valueLabel,
  linkSuggestionsId,
  onMove,
  onBlurField,
  onRemove,
  highlighted,
  commitOnEnter = false,
  cancelBlankOnEscape = false,
}, ref) {
  const rowKeys =
    commitOnEnter || cancelBlankOnEscape
      ? editableRowKeys({
          blank:
            !String(item.label ?? '').trim() &&
            !String(item[itemType] ?? '').trim(),
          commitOnEnter,
          cancelBlankOnEscape,
          onCancel: () => onRemove(index),
        })
      : undefined;

  return (
    <div
      ref={ref}
      className={`links-editor-row${highlighted ? ' links-editor-row--highlight' : ''}`}
      onKeyDown={rowKeys}
    >
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
});

export default ListItemRow;
