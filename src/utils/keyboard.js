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

// Enter-to-confirm for a confirmation dialog. Returns an onKeyDown handler
// for the dialog's content wrapper: Enter runs `onConfirm` — the same path
// the Confirm button's onClick uses, so the caller's busy/disabled guard
// still blocks a double-submit — regardless of which button currently holds
// focus, and preventDefault stops the focused button's own native
// Enter-activation (e.g. the initially-focused Cancel) from also firing.
// Left untouched: non-Enter keys (Space keeps native button behaviour,
// Escape stays the dialog's cancel via Modal), Enter mid-IME-composition,
// and Enter raised from inside a text field (TEXTAREA / INPUT /
// contentEditable) so a future confirm dialog with an input keeps normal
// typing.
export function confirmOnEnter(onConfirm) {
  return (event) => {
    if (event.key !== 'Enter') return;
    if (event.nativeEvent?.isComposing) return;
    const t = event.target;
    if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)) return;
    event.preventDefault();
    event.stopPropagation();
    onConfirm();
  };
}

// Enter/Escape behaviour for one row of a "+ Add"-style editable list.
// Returns an onKeyDown handler for the row's wrapper element:
//
//   Enter  (when commitOnEnter)      -> blur the row's <input>, committing
//                                       its value through the field's
//                                       existing onBlur — no new save path,
//                                       and preventDefault so it can never
//                                       submit a surrounding form.
//   Escape (when cancelBlankOnEscape -> run onCancel (the row's existing ×
//           AND `blank` is true)        / remove action). `blank` must be
//                                       derived from the row's *committed*
//                                       value(s), so a row holding real
//                                       (even if only draft-edited) content
//                                       is never removed by Escape.
//
// Only acts when the event originates from an <input> (so move/remove
// buttons inside the row keep their native Enter/Space). Ignored mid-IME
// composition. For a PlaceholderField-backed row the {…} autocomplete
// consumes Enter/Escape first (it stopPropagations while its menu is open),
// so this only runs with that menu closed.
export function editableRowKeys({ blank, commitOnEnter, cancelBlankOnEscape, onCancel }) {
  return (event) => {
    const el = event.target;
    if (!el || el.tagName !== 'INPUT') return;
    if (event.nativeEvent?.isComposing) return;

    if (commitOnEnter && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      el.blur();
    } else if (cancelBlankOnEscape && blank && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };
}
