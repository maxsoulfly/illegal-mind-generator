// Smoke test for the per-editor Copy-AI-Prompt adapters in
// authorPromptContexts.js. Cover is frozen separately by coverPrompt.test.js;
// this file covers the newer adapters (tagShortHooks; global/title added in
// later steps).
//
// Run: npx rolldown src/utils/authorPromptContexts.test.js -f esm -p node \
//        -o /tmp/apc.test.mjs && node /tmp/apc.test.mjs

import { buildAuthorPrompt } from './authorPrompt';
import { tagShortHooksContext, buildTagShortHooksPrompt } from './authorPromptContexts';

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
}

const projectConfig = {
  promptContext: 'Test Channel reworks existing songs; every part rebuilt by one person.',
  shortHookTypes: {
    nostalgia: {
      label: 'Nostalgia',
      templates: ['{artist} still hits different', '{song} still works in {currentYear}'],
    },
    progress: {
      label: 'Progress',
      templates: ['Re-recording this after {years} years', 'Past me vs current me'],
    },
  },
};

const tag = {
  name: 'darker',
  label: 'Darker',
  category: 'mood',
  promptContext:
    'Cover shifts the mood colder and bleaker — tone and atmosphere only, not tempo or heaviness.',
};

// --- full context: meaning + existing phrases + known angle ---
{
  const phrases = ['{song} feels colder now', 'A bleaker take on {song}'];
  const out = buildTagShortHooksPrompt(projectConfig, {
    tag,
    hookCategoryKey: 'nostalgia',
    hookCategoryLabel: 'Nostalgia',
    phrases,
  });

  assert(out.includes('Channel: Test Channel reworks'), 'full: project promptContext in CONTEXT');
  assert(out.includes('Tag: Darker (category: mood)'), 'full: tag label + category line');
  assert(
    out.includes('What this tag means (authoritative): Cover shifts the mood colder'),
    'full: tag promptContext is the authoritative meaning line',
  );
  assert(out.includes('Hook category / angle: Nostalgia'), 'full: angle line');
  assert(
    out.includes("This angle's general shape") && out.includes('"{artist} still hits different"'),
    'full: angle examples pulled from shortHookTypes[key].templates',
  );
  assert(
    out.includes('EXISTING HOOKS for this tag + this angle') &&
      out.includes('- {song} feels colder now'),
    'full: existing phrases listed under the EXISTING HOOKS section',
  );
  assert(
    out.includes('do NOT imitate it'),
    'full: existing-hooks framing warns against imitating weak entries',
  );
  assert(out.includes('PLACEHOLDERS (optional):'), 'full: placeholder section present');
  assert(
    out.includes('Every hook must fit BOTH this exact tag (Darker) and this exact angle (Nostalgia)'),
    'full: TASK rule names the concrete tag + angle',
  );
  assert(
    out.includes('Stay strictly within "What this tag means"'),
    'full: TASK rule pins hooks to the stated meaning (no assumed tempo/heaviness/etc.)',
  );
  assert(out.includes('{artist}') && out.includes('{song}'), 'full: placeholder list carries real tokens');
  assert(!out.includes('\n\n\n'), 'full: no triple blank line');
  assert(out.trimEnd() === out, 'full: no trailing whitespace');
}

// --- no promptContext -> explicit fallback line, no invented meaning ---
{
  const out = buildTagShortHooksPrompt(projectConfig, {
    tag: { name: 'x', label: 'X', category: 'genre', promptContext: '' },
    hookCategoryKey: 'nostalgia',
    hookCategoryLabel: 'Nostalgia',
    phrases: [],
  });
  assert(
    out.includes('(not set — infer ONLY from the tag name and category above'),
    'no-meaning: falls back to an explicit "not set" line',
  );
  assert(
    !out.includes('EXISTING HOOKS for this tag'),
    'no-phrases: EXISTING HOOKS section omitted entirely (no bare header)',
  );
}

// --- unknown angle key -> no examples line, label falls back ---
{
  const out = buildTagShortHooksPrompt(projectConfig, {
    tag,
    hookCategoryKey: 'made_up_angle',
    hookCategoryLabel: 'Made Up',
    phrases: [],
  });
  assert(out.includes('Hook category / angle: Made Up'), 'unknown-angle: label falls back to the passed label');
  assert(!out.includes("This angle's general shape"), 'unknown-angle: no angle-examples line when key missing from shortHookTypes');
}

// --- growth angle: examples reflect {years} pattern ---
{
  const out = buildTagShortHooksPrompt(projectConfig, {
    tag,
    hookCategoryKey: 'progress',
    hookCategoryLabel: 'Progress',
    phrases: [],
  });
  assert(
    out.includes('"Re-recording this after {years} years"'),
    'progress: angle examples carry the {years} growth pattern',
  );
}

// --- wrapper === buildAuthorPrompt(context) ---
{
  const opts = { tag, hookCategoryKey: 'nostalgia', hookCategoryLabel: 'Nostalgia', phrases: ['a'] };
  assert(
    buildTagShortHooksPrompt(projectConfig, opts) ===
      buildAuthorPrompt(tagShortHooksContext(projectConfig, opts)),
    'wrapper: buildTagShortHooksPrompt == buildAuthorPrompt(tagShortHooksContext(...))',
  );
}

if (failures > 0) {
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
