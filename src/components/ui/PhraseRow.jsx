import { forwardRef } from 'react';

import PlaceholderField from './PlaceholderField';
import MoveControls from './MoveControls';
import { editableRowKeys } from '../../utils/keyboard';

// Editable phrase row with a delete button.
// Accepts a ref for scroll-to behavior and a highlighted prop for visual focus.
// Optional placeholders enables the {placeholder} autocomplete dropdown.
// Optional onMoveUp/onMoveDown render a MoveControls pair in front of the
// field — omit both (the default) for the existing random-pick-pool callers
// (HookTemplateEditor, TagPhraseEditor), where item order carries no meaning.
//
// Opt-in keyboard behaviour for "+ Add"-style lists (both default off):
//   commitOnEnter        — Enter blurs the field, committing via the same
//                          onCommit that blur already calls.
//   cancelBlankOnEscape  — Escape removes the row (calls onRemove, i.e. the
//                          × button) but ONLY while its committed `value` is
//                          blank, so a row with real content is never
//                          removed by Escape.
// Both yield to PlaceholderField's {…} autocomplete while its menu is open.
const PhraseRow = forwardRef(function PhraseRow(
  {
    value,
    onCommit,
    onRemove,
    highlighted,
    placeholders,
    onMoveUp,
    onMoveDown,
    disabledMoveUp,
    disabledMoveDown,
    commitOnEnter = false,
    cancelBlankOnEscape = false,
  },
  ref,
) {
  const rowKeys =
    commitOnEnter || cancelBlankOnEscape
      ? editableRowKeys({
          blank: !String(value ?? '').trim(),
          commitOnEnter,
          cancelBlankOnEscape,
          onCancel: onRemove,
        })
      : undefined;

  return (
    <div
      ref={ref}
      className={`tag-phrase-row${highlighted ? ' tag-phrase-row--highlight' : ''}`}
      onKeyDown={rowKeys}
    >
      {(onMoveUp || onMoveDown) && (
        <MoveControls
          disabledUp={disabledMoveUp}
          disabledDown={disabledMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      )}

      <PlaceholderField
        defaultValue={value}
        onBlur={onCommit}
        placeholders={placeholders}
      />

      <button
        type="button"
        className="button-secondary"
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  );
});

export default PhraseRow;
