import { forwardRef } from 'react';

import PlaceholderField from './PlaceholderField';

// Editable phrase row with a delete button.
// Accepts a ref for scroll-to behavior and a highlighted prop for visual focus.
// Optional placeholders enables the {placeholder} autocomplete dropdown.
const PhraseRow = forwardRef(function PhraseRow(
  { value, onCommit, onRemove, highlighted, placeholders },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`tag-phrase-row${highlighted ? ' tag-phrase-row--highlight' : ''}`}
    >
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
