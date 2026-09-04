// Smoke test for keyboard.js -- the shared Enter/Escape helpers behind the
// app-wide keyboard UX consistency pass. Stage 1: clearOnEscape.
// Stage 2: cancelOnEscape. Stage 3: submitOnEnter.
// Stage 4 reuses cancelOnEscape (as an Escape-to-close for inline transient
// panels) with no helper change, so it adds no assertions here.
// Stage 5: editableRowKeys.
//
// Run: npx rolldown src/utils/keyboard.test.js -f esm -p node \
//        -o /tmp/kb.test.mjs && node /tmp/kb.test.mjs

import {
  clearOnEscape,
  cancelOnEscape,
  submitOnEnter,
  editableRowKeys,
  confirmOnEnter,
} from './keyboard';

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!cond) failures++;
};

// Minimal synthetic-event stub matching what React hands an onKeyDown.
function makeEvent({ key = 'Escape', isComposing = false } = {}) {
  return {
    key,
    nativeEvent: { isComposing },
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    },
  };
}

// --- non-empty value: Escape clears, and stops there --------------------
{
  let cleared = false;
  const handler = clearOnEscape('rammstein', () => {
    cleared = true;
  });
  const e = makeEvent();
  handler(e);
  ok(cleared, 'non-empty + Escape -> clear() called');
  ok(e.defaultPrevented, 'non-empty + Escape -> preventDefault (uniform across browsers)');
  ok(e.propagationStopped, 'non-empty + Escape -> stopPropagation (one Escape does not also close an enclosing panel)');
}

// --- empty value: Escape is left alone to bubble -----------------------
{
  let cleared = false;
  const handler = clearOnEscape('', () => {
    cleared = true;
  });
  const e = makeEvent();
  handler(e);
  ok(!cleared, 'empty + Escape -> clear() NOT called');
  ok(!e.defaultPrevented, 'empty + Escape -> preventDefault NOT called');
  ok(!e.propagationStopped, 'empty + Escape -> stopPropagation NOT called (event free to bubble)');
}

// --- nullish value guard --------------------------------------------------
{
  let calls = 0;
  const inc = () => {
    calls++;
  };
  clearOnEscape(undefined, inc)(makeEvent());
  clearOnEscape(null, inc)(makeEvent());
  ok(calls === 0, 'nullish value + Escape -> no-op');
}

// --- non-Escape keys ignored -------------------------------------------
{
  let cleared = false;
  const handler = clearOnEscape('metallica', () => {
    cleared = true;
  });
  for (const key of ['Enter', 'a', 'ArrowDown', 'Tab', 'Backspace']) {
    const e = makeEvent({ key });
    handler(e);
    ok(!cleared && !e.defaultPrevented, `key "${key}" -> ignored`);
  }
}

// --- IME composition in progress: leave Escape to the composition ------
{
  let cleared = false;
  const handler = clearOnEscape('日本語', () => {
    cleared = true;
  });
  const e = makeEvent({ isComposing: true });
  handler(e);
  ok(!cleared, 'Escape mid-composition -> clear() NOT called');
  ok(!e.defaultPrevented, 'Escape mid-composition -> preventDefault NOT called');
}

// === cancelOnEscape ===================================================

// --- Escape runs onCancel and stops propagation -----------------------
{
  let cancelled = 0;
  const handler = cancelOnEscape(() => {
    cancelled++;
  });
  const e = makeEvent();
  handler(e);
  ok(cancelled === 1, 'Escape -> onCancel() called');
  ok(e.propagationStopped, 'Escape -> stopPropagation (does not bubble further)');
  ok(!e.defaultPrevented, 'Escape -> no preventDefault (nothing native to suppress in a textarea)');
}

// --- non-Escape keys are left completely alone (Enter = newline) ------
{
  let cancelled = 0;
  const handler = cancelOnEscape(() => {
    cancelled++;
  });
  for (const key of ['Enter', 'a', ' ', 'ArrowUp', 'Backspace']) {
    const e = makeEvent({ key });
    handler(e);
    ok(!cancelled && !e.propagationStopped, `key "${key}" -> untouched`);
  }
}

// --- IME composition in progress: leave Escape alone -----------------
{
  let cancelled = 0;
  const handler = cancelOnEscape(() => {
    cancelled++;
  });
  const e = makeEvent({ isComposing: true });
  handler(e);
  ok(!cancelled, 'Escape mid-composition -> onCancel NOT called');
  ok(!e.propagationStopped, 'Escape mid-composition -> not consumed');
}

// === submitOnEnter ====================================================

// --- Enter with a valid condition submits exactly once ---------------
{
  let calls = 0;
  const handler = submitOnEnter(() => {
    calls++;
  }, 'Sponsor Shoutouts');
  const e = makeEvent({ key: 'Enter' });
  handler(e);
  ok(calls === 1, 'Enter + canSubmit truthy -> submit() called once');
}

// --- Enter with a falsy/empty condition does nothing (matches disabled +)
{
  let calls = 0;
  const submit = () => {
    calls++;
  };
  submitOnEnter(submit, '')(makeEvent({ key: 'Enter' })); // trimmed-empty name
  submitOnEnter(submit, false)(makeEvent({ key: 'Enter' })); // key && url, one empty
  submitOnEnter(submit, undefined)(makeEvent({ key: 'Enter' })); // default -> true... see below
  ok(calls === 1, "Enter + falsy canSubmit -> no submit; explicit undefined falls back to default(true) -> 1 call");
}

// --- default canSubmit is true when the arg is omitted --------------
{
  let calls = 0;
  submitOnEnter(() => {
    calls++;
  })(makeEvent({ key: 'Enter' }));
  ok(calls === 1, 'canSubmit omitted -> defaults to allowed');
}

// --- non-Enter keys never submit (Escape/typing/space untouched) ----
{
  let calls = 0;
  const handler = submitOnEnter(() => {
    calls++;
  }, 'valid');
  for (const key of ['Escape', 'a', ' ', 'Tab', 'ArrowDown']) handler(makeEvent({ key }));
  ok(calls === 0, 'non-Enter keys -> never submit');
}

// --- IME composition in progress: Enter is left to the composition --
{
  let calls = 0;
  const handler = submitOnEnter(() => {
    calls++;
  }, 'valid');
  handler(makeEvent({ key: 'Enter', isComposing: true }));
  ok(calls === 0, 'Enter mid-composition -> no submit');
}

// --- one keypress = one call (no double-submit) ---------------------
{
  let calls = 0;
  const handler = submitOnEnter(() => {
    calls++;
  }, 'valid');
  handler(makeEvent({ key: 'Enter' }));
  ok(calls === 1, 'single Enter -> exactly one submit');
}

// === editableRowKeys ==================================================

// Event stub with a target (tagName + blur spy).
function rowEvent({ key = 'Enter', isComposing = false, tagName = 'INPUT' } = {}) {
  let blurred = 0;
  const e = {
    key,
    nativeEvent: { isComposing },
    defaultPrevented: false,
    propagationStopped: false,
    target: { tagName, blur() { blurred++; } },
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this.propagationStopped = true; },
    get blurred() { return blurred; },
  };
  return e;
}

// --- Enter + commitOnEnter on an <input> -> blur (commit), consumed ----
{
  const h = editableRowKeys({ blank: false, commitOnEnter: true, cancelBlankOnEscape: true, onCancel: () => {} });
  const e = rowEvent({ key: 'Enter' });
  h(e);
  ok(e.blurred === 1, 'Enter + commitOnEnter -> field blurred once (commits via existing onBlur)');
  ok(e.defaultPrevented && e.propagationStopped, 'Enter -> preventDefault + stopPropagation (no form submit, no bubble)');
}

// --- Enter without commitOnEnter -> nothing --------------------------
{
  const h = editableRowKeys({ blank: true, commitOnEnter: false, cancelBlankOnEscape: true, onCancel: () => {} });
  const e = rowEvent({ key: 'Enter' });
  h(e);
  ok(e.blurred === 0 && !e.defaultPrevented, 'Enter + !commitOnEnter -> untouched');
}

// --- Enter from a non-input (move/remove button) -> nothing ---------
{
  const h = editableRowKeys({ blank: true, commitOnEnter: true, cancelBlankOnEscape: true, onCancel: () => {} });
  const e = rowEvent({ key: 'Enter', tagName: 'BUTTON' });
  h(e);
  ok(e.blurred === 0 && !e.defaultPrevented, 'Enter on a BUTTON in the row -> ignored (buttons keep native Enter)');
}

// --- Escape + cancelBlankOnEscape + blank -> onCancel, consumed -----
{
  let cancelled = 0;
  const h = editableRowKeys({ blank: true, commitOnEnter: true, cancelBlankOnEscape: true, onCancel: () => { cancelled++; } });
  const e = rowEvent({ key: 'Escape' });
  h(e);
  ok(cancelled === 1, 'Escape + blank row -> onCancel() called (row removed, = the × button)');
  ok(e.defaultPrevented && e.propagationStopped, 'Escape (handled) -> preventDefault + stopPropagation');
}

// --- Escape on a NON-blank row -> never removes (protects content) --
{
  let cancelled = 0;
  const h = editableRowKeys({ blank: false, commitOnEnter: true, cancelBlankOnEscape: true, onCancel: () => { cancelled++; } });
  const e = rowEvent({ key: 'Escape' });
  h(e);
  ok(cancelled === 0 && !e.defaultPrevented, 'Escape + non-blank row -> no removal, event left alone');
}

// --- Escape without cancelBlankOnEscape -> nothing -----------------
{
  let cancelled = 0;
  const h = editableRowKeys({ blank: true, commitOnEnter: true, cancelBlankOnEscape: false, onCancel: () => { cancelled++; } });
  h(rowEvent({ key: 'Escape' }));
  ok(cancelled === 0, 'Escape + !cancelBlankOnEscape -> untouched');
}

// --- IME composition in progress -> both keys left alone -----------
{
  let cancelled = 0;
  const h = editableRowKeys({ blank: true, commitOnEnter: true, cancelBlankOnEscape: true, onCancel: () => { cancelled++; } });
  const enter = rowEvent({ key: 'Enter', isComposing: true });
  const esc = rowEvent({ key: 'Escape', isComposing: true });
  h(enter); h(esc);
  ok(enter.blurred === 0 && cancelled === 0, 'mid-IME-composition -> neither Enter nor Escape acts');
}

// --- other keys -> never act -------------------------------------
{
  let cancelled = 0;
  const h = editableRowKeys({ blank: true, commitOnEnter: true, cancelBlankOnEscape: true, onCancel: () => { cancelled++; } });
  for (const key of ['a', ' ', 'Tab', 'ArrowDown', 'Backspace']) {
    const e = rowEvent({ key });
    h(e);
    ok(e.blurred === 0 && !e.defaultPrevented && cancelled === 0, `key "${key}" -> ignored`);
  }
}

// === confirmOnEnter ===================================================

function confirmEvent({ key = 'Enter', isComposing = false, tagName = 'BUTTON', isContentEditable = false } = {}) {
  return {
    key,
    nativeEvent: { isComposing },
    target: { tagName, isContentEditable },
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this.propagationStopped = true; },
  };
}

// --- Enter from a focused button -> confirm, native activation suppressed
{
  let confirmed = 0;
  const h = confirmOnEnter(() => { confirmed++; });
  const e = confirmEvent({ tagName: 'BUTTON' });
  h(e);
  ok(confirmed === 1, 'Enter (button focused) -> onConfirm() called');
  ok(e.defaultPrevented, 'Enter -> preventDefault (focused Cancel cannot also activate)');
  ok(e.propagationStopped, 'Enter -> stopPropagation');
}

// --- Enter from the message wrapper (non-interactive) -> confirm ------
{
  let confirmed = 0;
  confirmOnEnter(() => { confirmed++; })(confirmEvent({ tagName: 'DIV' }));
  ok(confirmed === 1, 'Enter from a non-field element -> confirm');
}

// --- Space is never touched (native button behaviour retained) -------
{
  let confirmed = 0;
  const e = confirmEvent({ key: ' ' });
  confirmOnEnter(() => { confirmed++; })(e);
  ok(confirmed === 0 && !e.defaultPrevented, 'Space -> left entirely to the native button');
}

// --- Escape is not this helper's job -------------------------------
{
  let confirmed = 0;
  const e = confirmEvent({ key: 'Escape' });
  confirmOnEnter(() => { confirmed++; })(e);
  ok(confirmed === 0 && !e.defaultPrevented, 'Escape -> untouched (Modal still cancels)');
}

// --- IME composition in progress -> no confirm ---------------------
{
  let confirmed = 0;
  const e = confirmEvent({ isComposing: true });
  confirmOnEnter(() => { confirmed++; })(e);
  ok(confirmed === 0 && !e.defaultPrevented, 'Enter mid-composition -> no confirm');
}

// --- Enter from inside a text field -> not hijacked ---------------
{
  let confirmed = 0;
  const inc = () => { confirmed++; };
  confirmOnEnter(inc)(confirmEvent({ tagName: 'TEXTAREA' }));
  confirmOnEnter(inc)(confirmEvent({ tagName: 'INPUT' }));
  confirmOnEnter(inc)(confirmEvent({ tagName: 'DIV', isContentEditable: true }));
  ok(confirmed === 0, 'Enter from TEXTAREA / INPUT / contentEditable -> normal typing, no confirm');
}

// --- busy guard is the caller's: a re-entrant confirm is a no-op ---
{
  let calls = 0;
  let busy = false;
  const guarded = () => { if (busy) return; busy = true; calls++; };
  const h = confirmOnEnter(guarded);
  h(confirmEvent());
  h(confirmEvent());
  ok(calls === 1, 'two Enters -> guarded onConfirm still runs once (busy guard respected)');
}

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
