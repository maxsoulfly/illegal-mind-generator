import { forwardRef } from 'react';

import PlaceholderField from './PlaceholderField';
import MoveControls from './MoveControls';

// Editable phrase row with a delete button.
// Accepts a ref for scroll-to behavior and a highlighted prop for visual focus.
// Optional placeholders enables the {placeholder} autocomplete dropdown.
// Optional onMoveUp/onMoveDown render a MoveControls pair in front of the
// field — omit both (the default) for the existing random-pick-pool callers
// (HookTemplateEditor, TagPhraseEditor), where item order carries no meaning.
const PhraseRow = forwardRef(function PhraseRow(
  { value, onCommit, onRemove, highlighted, placeholders, onMoveUp, onMoveDown, disabledMoveUp, disabledMoveDown },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`tag-phrase-row${highlighted ? ' tag-phrase-row--highlight' : ''}`}
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
