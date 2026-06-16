import { useEffect, useRef, useState } from 'react';

// Scan backwards from the cursor for an unclosed '{' with no space/newline/
// '}' in between — that's an active placeholder query in progress.
function detectTrigger(text, cursor) {
  let i = cursor - 1;

  while (i >= 0) {
    const ch = text[i];

    if (ch === '{') {
      return { start: i, query: text.slice(i + 1, cursor) };
    }

    if (ch === '}' || ch === ' ' || ch === '\n' || ch === '\t') {
      return null;
    }

    i -= 1;
  }

  return null;
}

// A single-line input or textarea that offers an autocomplete dropdown for
// {placeholder} syntax. Typing '{' starts tracking a query; matching
// placeholders (passed in, braces included, e.g. '{artist}') show in a
// dropdown below the field. Resyncs display value if defaultValue changes
// from outside (e.g. a reset-to-default elsewhere) without remounting.
//
// Two save modes, pick one: onBlur (commit only when focus leaves, the
// default — used by PhraseRow/TextBlockEditor) or onChange (live, every
// keystroke and every placeholder insert — used by fully-controlled fields
// like ToggleInputRow's prefix/suffix inputs).
export default function PlaceholderField({
  defaultValue = '',
  onBlur,
  onChange,
  placeholders = [],
  multiline = false,
  rows = 4,
  className,
  disabled = false,
  placeholder,
}) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState(null);
  const [triggerStart, setTriggerStart] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const fieldRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const matches =
    query === null
      ? []
      : placeholders.filter((p) =>
          p.slice(1, -1).toLowerCase().includes(query.toLowerCase()),
        );

  function handleChange(e) {
    const next = e.target.value;
    setValue(next);
    onChange?.(next);

    const trigger = detectTrigger(next, e.target.selectionStart);

    if (trigger) {
      setTriggerStart(trigger.start);
      setQuery(trigger.query);
      setActiveIndex(0);
    } else {
      setTriggerStart(null);
      setQuery(null);
    }
  }

  function insertPlaceholder(token) {
    if (triggerStart === null) return;

    const cursor = fieldRef.current.selectionStart;
    const before = value.slice(0, triggerStart);
    const after = value.slice(cursor);
    const next = `${before}${token}${after}`;

    setValue(next);
    onChange?.(next);
    setQuery(null);
    setTriggerStart(null);

    requestAnimationFrame(() => {
      const pos = before.length + token.length;
      fieldRef.current.focus();
      fieldRef.current.setSelectionRange(pos, pos);
    });
  }

  function handleKeyDown(e) {
    if (query === null || matches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      insertPlaceholder(matches[activeIndex]);
    } else if (e.key === 'Escape') {
      setQuery(null);
      setTriggerStart(null);
    }
  }

  function handleBlur() {
    setQuery(null);
    setTriggerStart(null);
    onBlur?.(value);
  }

  const Field = multiline ? 'textarea' : 'input';
  const resolvedClassName = className ?? (multiline ? 'form-textarea' : 'form-input');

  return (
    <div className="placeholder-field">
      <Field
        ref={fieldRef}
        className={resolvedClassName}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        {...(multiline ? { rows } : {})}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {query !== null && matches.length > 0 && (
        <ul className="placeholder-suggestions">
          {matches.map((p, i) => (
            <li
              key={p}
              className={`placeholder-suggestion${i === activeIndex ? ' placeholder-suggestion--active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                insertPlaceholder(p);
              }}
            >
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
