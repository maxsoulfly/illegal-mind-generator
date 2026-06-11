import { useEffect, useState } from 'react';

// Editable phrase row with a delete button.
// Uses local state for display so typing feels responsive,
// but only calls onCommit on blur — keeping saves cheap for future DB use.
export default function PhraseRow({ value, onCommit, onRemove }) {
  const [displayValue, setDisplayValue] = useState(value);

  // Sync if the value changes from outside (e.g. reset).
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div className="tag-phrase-row">
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
}
