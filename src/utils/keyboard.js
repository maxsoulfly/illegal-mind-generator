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

// Escape-to-cancel for a transient open editor surface — a Bulk Add box, a
// paste box. Returns an onKeyDown handler for the surface's wrapper: a
// bubbled Escape runs onCancel and stops there. Anything nested that wants
// Escape for itself first (PlaceholderField's {…} autocomplete) must
// stopPropagation when it consumes the key, so this only ever fires on an
// otherwise-unhandled Escape — i.e. a second Escape once the dropdown is
// closed. Ignored mid-IME composition.
export function cancelOnEscape(onCancel) {
  return (event) => {
    if (event.key !== 'Escape') return;
    if (event.nativeEvent?.isComposing) return;
    event.stopPropagation();
    onCancel();
  };
}

// Enter-to-submit for a single-line "add / create" row. Returns an
// onKeyDown handler: pressing Enter in the row's text input runs `submit`
// — the exact same handler the row's + / Add button calls — gated by
// `canSubmit`, which should be the same truthy condition the button's
// `disabled` uses (e.g. name.trim()). Ignored mid-IME composition. Do NOT
// use on a multiline field: Enter there must stay a newline.
export function submitOnEnter(submit, canSubmit = true) {
  return (event) => {
    if (event.key !== 'Enter') return;
    if (event.nativeEvent?.isComposing) return;
    if (!canSubmit) return;
    submit();
  };
}
