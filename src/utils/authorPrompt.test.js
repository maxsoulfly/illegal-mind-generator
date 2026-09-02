// Smoke test for the shared "Copy AI Prompt" skeleton (authorPrompt.js).
//
// This project has no test runner configured (no vitest/jest). Run directly
// with rolldown (a transitive Vite dependency, see node_modules/.bin/rolldown)
// bundling to a temporary ESM file, then executing with node — the same
// "Node smoke test" pattern used throughout this project's history:
//
//   npx rolldown src/utils/authorPrompt.test.js -f esm -p node -o /tmp/ap.test.mjs \
//     && node /tmp/ap.test.mjs
//
// Covers only the assembly/formatting contract here — the per-editor adapters
// (authorPromptContexts.js) and the cover-output A/B freeze get their own
// tests in later steps.

import {
  buildAuthorPrompt,
  headedList,
  headedBullets,
  contextLines,
  placeholderNote,
  RULE,
} from './authorPrompt';

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
}

// --- buildAuthorPrompt: joins with one blank line ---
{
  const out = buildAuthorPrompt(['A', 'B', 'C']);
  assert(out === 'A\n\nB\n\nC', 'joins sections with exactly one blank line between');
}

// --- buildAuthorPrompt: drops falsy / whitespace-only sections ---
{
  const out = buildAuthorPrompt(['A', null, undefined, false, '', '   ', 'B']);
  assert(out === 'A\n\nB', 'drops null/undefined/false/empty/whitespace-only sections');
}

// --- buildAuthorPrompt: trims trailing whitespace, no leading blank ---
{
  const out = buildAuthorPrompt(['intro', 'body\n\n']);
  assert(out === 'intro\n\nbody', 'trailing whitespace trimmed');
  assert(!out.startsWith('\n'), 'no leading blank line');
}

// --- buildAuthorPrompt: empty input ---
{
  assert(buildAuthorPrompt([]) === '', 'empty section list yields empty string');
  assert(buildAuthorPrompt() === '', 'no argument yields empty string');
}

// --- headedList ---
{
  assert(
    headedList('CONTEXT', ['one', 'two']) === 'CONTEXT\none\ntwo',
    'headedList: heading then one item per line',
  );
  assert(headedList('CONTEXT', []) === '', 'headedList: empty items -> "" (section drops out)');
  assert(
    headedList('CONTEXT', [], { keepHeading: true }) === 'CONTEXT',
    'headedList: keepHeading keeps a bare header',
  );
  assert(
    headedList('CONTEXT', ['a', '', '   ', 'b']) === 'CONTEXT\na\nb',
    'headedList: skips blank items',
  );
}

// --- headedBullets ---
{
  assert(
    headedBullets('TASK', ['do x', 'do y']) === 'TASK\n- do x\n- do y',
    'headedBullets: each item prefixed with "- "',
  );
  assert(headedBullets('TASK', []) === '', 'headedBullets: empty -> ""');
}

// --- contextLines ---
{
  const lines = contextLines({
    Channel: 'Some channel',
    Tag: '  Heavier (energy)  ',
    Meaning: '',
    Empty: null,
  });
  assert(
    JSON.stringify(lines) === JSON.stringify(['Channel: Some channel', 'Tag: Heavier (energy)']),
    'contextLines: "Label: value", trims, skips empty/nullish, preserves order',
  );
}

// --- placeholderNote ---
{
  assert(placeholderNote([]) === '', 'placeholderNote: empty token list -> ""');
  const note = placeholderNote(['{artist}', '{song}']);
  assert(note.startsWith('PLACEHOLDERS (optional):'), 'placeholderNote: standard header');
  assert(note.includes('{artist}, {song}'), 'placeholderNote: comma-joined token list');
  assert(note.includes("Don't force them"), 'placeholderNote: carries the "don\'t force" guidance');
}

// --- RULE fragments are non-empty strings ---
{
  const allStrings = Object.values(RULE).every((v) => typeof v === 'string' && v.trim().length > 10);
  assert(allStrings, 'RULE: every fragment is a non-trivial string');
}

// --- integration: a cover-shaped prompt assembles with clean spacing ---
{
  const out = buildAuthorPrompt([
    'I need extra lines for one thing.',
    headedList('CONTEXT', ['Channel: X', 'Artist: Y']),
    placeholderNote(['{artist}']),
    headedBullets('TASK', [RULE.PLAIN_LINES, RULE.NO_INVENTED_FACTS]),
    headedList('Tone to aim for (illustrative only):', ['- sample one', '- sample two']),
  ]);

  assert(!out.includes('\n\n\n'), 'integration: never more than one consecutive blank line');
  assert(out.split('\n\n').length === 5, 'integration: exactly 5 blank-line-separated blocks');
  assert(
    out.startsWith('I need extra lines for one thing.\n\nCONTEXT\n'),
    'integration: intro then CONTEXT block',
  );
  assert(out.trimEnd() === out, 'integration: no trailing whitespace');
}

if (failures > 0) {
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
