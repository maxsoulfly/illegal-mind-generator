// Smoke test for the per-editor Copy-AI-Prompt adapters in
// authorPromptContexts.js. Cover is frozen separately by coverPrompt.test.js;
// this file covers the newer adapters (tagShortHooks; global/title added in
// later steps).
//
// Run: npx rolldown src/utils/authorPromptContexts.test.js -f esm -p node \
//        -o /tmp/apc.test.mjs && node /tmp/apc.test.mjs

import { buildAuthorPrompt } from './authorPrompt';
import {
  tagShortHooksContext,
  buildTagShortHooksPrompt,
  globalShortHookContext,
  buildGlobalShortHookPrompt,
} from './authorPromptContexts';

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

// ===========================================================================
// globalShortHookContext / buildGlobalShortHookPrompt
// ===========================================================================

// --- angle with templates, no flags ---
{
  const out = buildGlobalShortHookPrompt(projectConfig, {
    hookTypeKey: 'nostalgia',
    hookConfig: {
      label: 'Nostalgia',
      templates: ['{artist} still hits different', '{decade} songs went hard'],
    },
  });
  assert(out.includes('Channel: Test Channel reworks'), 'global: channel promptContext in CONTEXT');
  assert(out.includes('Short Hook angle: Nostalgia'), 'global: angle line');
  assert(
    out.includes('CURRENT LINES for this angle') && out.includes('- {artist} still hits different'),
    'global: existing templates listed as the house voice',
  );
  assert(
    out.includes('Match the tone and phrasing of the current lines above.'),
    'global: TASK asks to match the existing voice when templates exist',
  );
  assert(
    out.includes('work for ANY cover where the "Nostalgia" angle applies'),
    'global: TASK pins lines to reusability across covers, not one song/tag',
  );
  assert(
    !out.includes('fit a different song, tag, or genre unchanged'),
    'global: does NOT use the tag/cover "no generic filler" rule (base lines are meant to be generic)',
  );
  assert(out.includes('No empty mood-words'), 'global: uses the anti-empty-mood-words rule instead');
  assert(
    !out.includes('This angle only runs when'),
    'global: no flag lines when hookConfig has no flags',
  );
  assert(out.includes('PLACEHOLDERS (optional):'), 'global: placeholder section present');
  assert(!out.includes('\n\n\n'), 'global: no triple blank line');

  // --- placeholder semantic-type guidance ---
  assert(out.includes('\nPLACEHOLDER TYPES\n'), 'global: dedicated PLACEHOLDER TYPES section');
  assert(
    out.indexOf('PLACEHOLDER TYPES') < out.indexOf('\nTASK\n'),
    'global: PLACEHOLDER TYPES section comes before TASK',
  );
  assert(
    out.includes('{primaryTag} is NOT type-safe'),
    'global: explains {primaryTag} has no fixed semantic type',
  );
  assert(
    out.includes('"went {primaryTag}"') && out.includes('"a {primaryTag} version"'),
    'global: names the exact unsafe constructions',
  );
  assert(
    out.includes('{tags.genre} (punk / metal / hardcore') &&
      out.includes('{tags.tempo} (faster / slower)'),
    'global: points at typed category tokens for typed slots',
  );
  assert(
    out.includes(
      'reusable: {artist}, {song}, {transformation}, {originalGenre}, {years}, {decade}.',
    ),
    'global: the "lean on placeholders" list no longer pushes {primaryTag}',
  );
  assert(
    !out.includes('{transformation}, {primaryTag}, {originalGenre}'),
    'global: old {primaryTag}-in-the-list wording is gone',
  );
  assert(
    out.includes(
      'never put {primaryTag} in a slot that assumes a genre, tempo, mood, or adjective',
    ),
    'global: TASK cross-references the PLACEHOLDER TYPES notes',
  );
}

// --- angle with both flags ---
{
  const out = buildGlobalShortHookPrompt(projectConfig, {
    hookTypeKey: 'contrast',
    hookConfig: {
      label: 'Contrast',
      excludeForFaithful: true,
      requiresGenre: true,
      templates: ['A {originalGenre} classic, but {primaryTag}'],
    },
  });
  assert(
    out.includes('skipped for faithful covers and original songs'),
    'global: excludeForFaithful -> transformation-allowed boundary line',
  );
  assert(
    out.includes("original genre is known — a line may use {originalGenre}"),
    'global: requiresGenre -> {originalGenre} boundary line',
  );
}

// --- empty angle (freshly added, no templates) ---
{
  const out = buildGlobalShortHookPrompt(projectConfig, {
    hookTypeKey: 'sponsor',
    hookConfig: { label: 'Sponsor', templates: [] },
  });
  assert(
    out.includes("establishing its voice from scratch"),
    'global: empty angle -> "from scratch" note',
  );
  assert(!out.includes('CURRENT LINES for this angle'), 'global: no CURRENT LINES section when empty');
  assert(
    !out.includes('Match the tone and phrasing of the current lines'),
    'global: no "match the voice" rule when there are no lines',
  );
}

// --- wrapper identity ---
{
  const opts = { hookTypeKey: 'emotion', hookConfig: { label: 'Emotion', templates: ['x'] } };
  assert(
    buildGlobalShortHookPrompt(projectConfig, opts) ===
      buildAuthorPrompt(globalShortHookContext(projectConfig, opts)),
    'wrapper: buildGlobalShortHookPrompt == buildAuthorPrompt(globalShortHookContext(...))',
  );
}

if (failures > 0) {
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
