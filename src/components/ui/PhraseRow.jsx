import { forwardRef, useEffect, useState } from 'react';

// Editable phrase row with a delete button.
// Uses local state for display so typing feels responsive,
// but only calls onCommit on blur — keeping saves cheap for future DB use.
// Accepts a ref for scroll-to behavior and a highlighted prop for visual focus.
const PhraseRow = forwardRef(function PhraseRow({ value, onCommit, onRemove, highlighted }, ref) {
  const [displayValue, setDisplayValue] = useState(value);

  // Sync if the value changes from outside (e.g. reset).
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div
      ref={ref}
      className={`tag-phrase-row${highlighted ? ' tag-phrase-row--highlight' : ''}`}
    >
      <input
        className="form-input"
        value={displayValue}
        onChange={(e) => setDisplayValue(e.target.value)}
        onBlur={(e) => onCommit(e.target.value)}
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
