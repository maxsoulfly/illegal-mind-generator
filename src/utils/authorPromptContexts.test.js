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
  titlePoolContext,
  buildTitlePoolPrompt,
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
  assert(
    out.includes('Do NOT use the {transformation} placeholder'),
    'full: TASK forbids the {transformation} placeholder in new tag hooks',
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
    out.includes('reusable: {artist}, {song}, {originalGenre}, {years}, {decade}.'),
    'global: the "lean on placeholders" list pushes neither {primaryTag} nor {transformation}',
  );
  assert(
    !out.includes('{song}, {transformation}, {originalGenre}'),
    'global: {transformation} is no longer in the "lean on" list',
  );
  assert(
    out.includes(
      'never put {primaryTag} in a slot that assumes a genre, tempo, mood, or adjective',
    ),
    'global: TASK cross-references the PLACEHOLDER TYPES notes',
  );

  // --- no {transformation} in new lines ---
  assert(
    out.includes('Do NOT use {transformation} in any new line'),
    'global: TASK explicitly forbids {transformation} in new lines',
  );
  assert(
    out.includes(
      '{transformation} appears in some existing lines but must NOT be used in a new one',
    ),
    'global: PLACEHOLDER TYPES marks {transformation} as existing-only',
  );
  assert(
    !out.includes('safe choice for "{song}, but {transformation}"'),
    'global: the old "{transformation} is the safe choice" wording is gone',
  );
  assert(
    out.includes('do not use {transformation}, even if some of these do'),
    'global: CURRENT LINES framing warns off {transformation} despite house-voice matching',
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

// ===========================================================================
// titlePoolContext / buildTitlePoolPrompt
// ===========================================================================

const titleProjectConfig = {
  promptContext: 'Test Channel reworks existing songs.',
  title: { connector: '&' },
};

const NO_TRANSFORMATION_RULE = 'Do NOT use {transformation} in any new template.';

// --- standard pool: no {transformation}, push typed placeholders + new shapes ---
{
  const out = buildTitlePoolPrompt(titleProjectConfig, {
    groupName: 'standard',
    groupLabel: 'Standard',
    templates: ['{artist} - {song} // {transformation}', '{song} // {transformation}'],
  });
  assert(out.includes('Title pool: Standard (key: standard)'), 'title/standard: pool line');
  assert(out.includes('What this pool is for: The main title format'), 'title/standard: role line');
  assert(
    out.includes('CURRENT TEMPLATES in this pool') && out.includes('- {song} // {transformation}'),
    'title/standard: existing templates still shown (as tone reference)',
  );
  assert(out.includes(NO_TRANSFORMATION_RULE), 'title/standard: TASK forbids {transformation} in new templates');
  assert(
    !out.includes('MUST contain {transformation}'),
    'title/standard: no leftover must-contain-{transformation} rule',
  );
  assert(
    out.includes('use a typed category placeholder ({tags.genre}, {tags.energy}, {tags.tempo}'),
    'title/standard: TASK points at typed category placeholders for the rework slot',
  );
  assert(
    out.includes('Introduce structures this pool does not already have'),
    'title/standard: TASK asks for genuinely new structures, not reworded copies',
  );
  assert(
    !out.includes('Keep the structural shape of the existing'),
    'title/standard: old "keep the shape" rule is gone',
  );
  assert(out.includes('Write TEMPLATES, not finished titles'), 'title/standard: templates-not-titles rule');
  assert(
    out.includes('prefix/suffix system adds those automatically'),
    'title/standard: signal-number/channel goes to the wrapper, not the template',
  );
  assert(!out.includes('joined with "&"'), 'title/standard: connector note removed (no {transformation})');
  assert(out.includes('\nPLACEHOLDER TYPES\n'), 'title/standard: PLACEHOLDER TYPES section present');
  assert(
    out.includes('{transformation} appears in the EXISTING templates but must NOT be used in any new suggestion'),
    'title/standard: PLACEHOLDER TYPES marks {transformation} as existing-only',
  );
  assert(out.includes('{primaryTag} is NOT type-safe'), 'title/standard: primaryTag type warning carried into titles');
  assert(
    !out.includes('Use {transformation} instead'),
    'title/standard: PLACEHOLDER TYPES no longer redirects {primaryTag} -> {transformation}',
  );
  assert(!out.includes('\n\n\n'), 'title/standard: no triple blank line');
  assert(out.trimEnd() === out, 'title/standard: no trailing whitespace');
}

// --- butIts pool: also no {transformation}; keeps the faithful-skip note ---
{
  const out = buildTitlePoolPrompt(titleProjectConfig, {
    groupName: 'butIts',
    groupLabel: "But It's",
    templates: ["{song} but it's {transformation}"],
  });
  assert(out.includes(NO_TRANSFORMATION_RULE), 'title/butIts: TASK forbids {transformation} in new templates');
  assert(
    out.includes('skipped automatically for faithful covers and original songs'),
    'title/butIts: role keeps the automatic faithful/original skip note',
  );
  assert(
    out.includes('fill that slot another way') && out.includes('vary the framing'),
    'title/butIts: role tells the AI to fill the "it\'s ___" slot without {transformation} and vary the framing',
  );
}

// --- generic pool ---
{
  const out = buildTitlePoolPrompt(titleProjectConfig, {
    groupName: 'generic',
    groupLabel: 'Generic',
    templates: ['{song} // Test Rework'],
  });
  assert(out.includes(NO_TRANSFORMATION_RULE), 'title/generic: TASK forbids {transformation}');
  assert(
    out.includes('do not depend on the selected tags'),
    'title/generic: role unchanged in intent',
  );
  assert(!out.includes('joined with "&"'), 'title/generic: no connector note');
}

// --- empty pool + unknown key ---
{
  const out = buildTitlePoolPrompt(titleProjectConfig, {
    groupName: 'promo',
    groupLabel: 'Promo',
    templates: [],
  });
  assert(
    out.includes("establishing its shape and voice from scratch"),
    'title/empty: from-scratch note replaces CURRENT TEMPLATES',
  );
  assert(!out.includes('What this pool is for:'), 'title/unknown-key: no role line for a non-default pool');
  assert(out.includes(NO_TRANSFORMATION_RULE), 'title/unknown-key: {transformation} still forbidden');
}

// --- wrapper identity ---
{
  const opts = { groupName: 'standard', groupLabel: 'Standard', templates: ['{song} // {transformation}'] };
  assert(
    buildTitlePoolPrompt(titleProjectConfig, opts) ===
      buildAuthorPrompt(titlePoolContext(titleProjectConfig, opts)),
    'wrapper: buildTitlePoolPrompt == buildAuthorPrompt(titlePoolContext(...))',
  );
}

if (failures > 0) {
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
