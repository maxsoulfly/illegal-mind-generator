import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
  // Viewport rect of the field, captured in event handlers (not read during
  // render — refs aren't safe there). Drives the portaled fixed-position
  // dropdown. null = dropdown closed.
  const [anchorRect, setAnchorRect] = useState(null);
  const fieldRef = useRef(null);

  const closeMenu = () => {
    setQuery(null);
    setTriggerStart(null);
    setAnchorRect(null);
  };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // The suggestions list is portaled to <body> and positioned as fixed (see
  // render), so it escapes the .phrase-row-list scroll container's overflow
  // clip. Fixed coords go stale on scroll/resize — cheapest correct fix is
  // to dismiss the dropdown then (a common autocomplete behaviour). Listener
  // is capture-phase so it catches scrolls in any ancestor, not just window.
  useEffect(() => {
    if (query === null) return undefined;

    const dismiss = () => {
      setQuery(null);
      setTriggerStart(null);
      setAnchorRect(null);
    };

    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);

    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [query]);

  const matches =
    query === null
      ? []
      : placeholders.filter((p) =>
          p.slice(1, -1).toLowerCase().includes(query.toLowerCase()),
        );

  function handleChange(e) {
    const field = e.target;
    const next = field.value;
    setValue(next);
    onChange?.(next);

    const trigger = detectTrigger(next, field.selectionStart);

    if (trigger) {
      setTriggerStart(trigger.start);
      setQuery(trigger.query);
      setActiveIndex(0);
      setAnchorRect(field.getBoundingClientRect());
    } else {
      closeMenu();
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
    closeMenu();

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
      closeMenu();
    }
  }

  function handleBlur() {
    closeMenu();
    onBlur?.(value);
  }

  const Field = multiline ? 'textarea' : 'input';
  const resolvedClassName = className ?? (multiline ? 'form-textarea' : 'form-input');

  // Anchor the (portaled, fixed) dropdown to the field rect captured on the
  // last keystroke — refs can't be read during render.
  const anchor = query !== null && matches.length > 0 ? anchorRect : null;

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
      {anchor &&
        createPortal(
          <ul
            className="placeholder-suggestions"
            style={{
              position: 'fixed',
              left: anchor.left,
              top: anchor.bottom + 4,
              width: anchor.width,
              right: 'auto',
              marginTop: 0,
            }}
          >
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
          </ul>,
          document.body,
        )}
    </div>
  );
}
