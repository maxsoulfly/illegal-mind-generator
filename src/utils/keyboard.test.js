// Smoke test for keyboard.js -- the shared Enter/Escape helpers behind the
// app-wide keyboard UX consistency pass. Stage 1 covers clearOnEscape only.
//
// Run: npx rolldown src/utils/keyboard.test.js -f esm -p node \
//        -o /tmp/kb.test.mjs && node /tmp/kb.test.mjs

import { clearOnEscape } from './keyboard';

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

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
