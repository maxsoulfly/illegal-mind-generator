// Shared keyboard-interaction helpers for the app-wide Enter/Escape
// consistency pass. Pure functions that build DOM/React event handlers —
// no React import, no side effects of their own, so they stay trivially
// unit-testable.

// Escape-to-clear for a search / filter input. Returns an onKeyDown handler:
// while the field holds a value, Escape clears it and stops there (so a
// single Escape doesn't also close an enclosing picker/panel — that second
// Escape, now on an empty field, is what closes it). When the field is
// already empty, Escape is left untouched to bubble. Ignored mid-IME
// composition so it doesn't fight a composition-cancel Escape.
export function clearOnEscape(value, clear) {
  return (event) => {
    if (event.key !== 'Escape') return;
    if (event.nativeEvent?.isComposing) return;
    if (!value) return;
    event.preventDefault();
    event.stopPropagation();
    clear();
  };
}
