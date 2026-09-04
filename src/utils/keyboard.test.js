// Smoke test for keyboard.js -- the shared Enter/Escape helpers behind the
// app-wide keyboard UX consistency pass. Stage 1: clearOnEscape.
// Stage 2: cancelOnEscape. Stage 3: submitOnEnter.
//
// Run: npx rolldown src/utils/keyboard.test.js -f esm -p node \
//        -o /tmp/kb.test.mjs && node /tmp/kb.test.mjs

import { clearOnEscape, cancelOnEscape, submitOnEnter } from './keyboard';

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

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
