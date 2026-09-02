// Smoke test for the Add Tag -> Copy AI Prompt round-trip (tagPrompt.js).
//
// Covers the 2026-09-03 rework: the prompt now generates the tag's
// promptContext, asks for much shorter TITLE / Short Hook entries, forbids
// invented facts, drops the placeholder quota, and applies the
// {transformation} / {primaryTag} rules. The parser gained a PROMPT_CONTEXT
// text section and must stay backward-compatible with responses that omit it.
//
// Run: npx rolldown src/utils/tagPrompt.test.js -f esm -p node \
//        -o /tmp/tp.test.mjs && node /tmp/tp.test.mjs

import { buildTagPrompt, parseTagResponse } from './tagPrompt';

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!cond) failures++;
};

const SHORT_HOOK_TYPES = {
  emotion: { label: 'Emotion', templates: ['{song} hits differently now', 'Some songs never lose energy'] },
  contrast: { label: 'Contrast', templates: ['A {originalGenre} classic, but {primaryTag}'] },
  progress: { label: 'Progress', templates: ['Re-recording this after {years} years', 'Past me vs current me'] },
};

// ===========================================================================
// buildTagPrompt
// ===========================================================================
{
  const prompt = buildTagPrompt('Industrial Metal', 'genre', SHORT_HOOK_TYPES);

  ok(prompt.includes('\nPROMPT_CONTEXT:\n'), 'build: has a PROMPT_CONTEXT section header on its own line');
  ok(
    prompt.includes('what it does NOT necessarily imply'),
    'build: PROMPT_CONTEXT hint asks for what the tag does NOT imply',
  );
  ok(
    prompt.includes('Industrial metal combines heavy guitar riffing'),
    'build: PROMPT_CONTEXT hint carries the worked example',
  );

  ok(!/4 of the 6|at least 4|4-6 phrases/i.test(prompt), 'build: the "4 of 6 phrases must use a placeholder" quota is gone');
  ok(prompt.includes('never to hit a quota'), 'build: placeholders explicitly not required to hit a quota');
  ok(prompt.includes('Do NOT use {transformation}'), 'build: forbids {transformation}');
  ok(prompt.includes('{primaryTag} is NOT type-safe'), 'build: flags {primaryTag} as type-unsafe');
  ok(
    prompt.includes('{tags.genre}') && prompt.includes('{tags.tempo}') && prompt.includes('{tags.production}'),
    'build: lists the typed category tokens',
  );
  ok(prompt.includes('{artist}, {song}, {year}, {years}, {decade}, {currentYear} are always safe'), 'build: names the always-safe tokens');

  ok(
    prompt.includes('never invent') || prompt.includes('You only know what the tag MEANS'),
    'build: has the no-invented-facts rule',
  );
  ok(prompt.includes('omit that whole section'), 'build: reinforces skipping Musician/Progress rather than inventing');
  ok(
    prompt.includes("taught me to treat percussion like part of the riff"),
    'build: names a concrete invented-fact example to avoid',
  );

  ok(prompt.includes('ideally 1-3 words'), 'build: TITLE hint asks for 1-3 word fragments');
  ok(prompt.includes('not full titles'), 'build: TITLE hint clarifies these are fragments');

  ok(prompt.includes('roughly 5-12 words'), 'build: Short Hooks hint gives the 5-12 word target');
  ok(prompt.includes('ONE meaningful trait'), 'build: Short Hooks hint asks for one trait per line, not several');
  ok(
    prompt.includes('running through distorted guitars and mechanical percussion'),
    'build: Short Hooks hint shows the too-long bad example',
  );
  ok(
    prompt.includes('if a shown example uses {transformation} or {primaryTag}, follow its theme but not that token'),
    'build: caveat for example templates that use forbidden tokens',
  );

  ok(prompt.includes('DESCRIPTION_TECHNICAL:'), 'build: DESCRIPTION_TECHNICAL section preserved');
  ok(prompt.includes('DESCRIPTION_LOG:'), 'build: DESCRIPTION_LOG section preserved');
  ok(prompt.includes('DESCRIPTION_STATUS:'), 'build: DESCRIPTION_STATUS section preserved');
  ok(prompt.includes('HASHTAGS:'), 'build: HASHTAGS section preserved');
  ok(prompt.includes('THUMBNAIL:'), 'build: THUMBNAIL section preserved');

  ok(
    prompt.includes('SHORTHOOKS_EMOTION:') &&
      prompt.includes('SHORTHOOKS_CONTRAST:') &&
      prompt.includes('SHORTHOOKS_PROGRESS:'),
    'build: one SHORTHOOKS_<KEY>: per shortHookTypes key',
  );
  ok(
    prompt.includes('theme reference: "A {originalGenre} classic, but {primaryTag}"'),
    'build: still shows the real example templates (theme reference)',
  );
}

// ===========================================================================
// parseTagResponse
// ===========================================================================

// --- PROMPT_CONTEXT on its own line, one sentence ------------------------
{
  const res = parseTagResponse(
    [
      'PROMPT_CONTEXT:',
      'Industrial metal fuses heavy riffing with mechanical, programmed percussion; do not assume a tempo or vocal style.',
      '',
      'TITLE:',
      'Industrial',
      'Machine Metal',
    ].join('\n'),
    SHORT_HOOK_TYPES,
  );
  ok(
    res.promptContext ===
      'Industrial metal fuses heavy riffing with mechanical, programmed percussion; do not assume a tempo or vocal style.',
    'parse: PROMPT_CONTEXT (own line) captured as promptContext string',
  );
  ok(JSON.stringify(res.title) === JSON.stringify(['Industrial', 'Machine Metal']), 'parse: TITLE still parses after PROMPT_CONTEXT');
}

// --- multi-line definition -> space-joined + trimmed --------------------
{
  const res = parseTagResponse(
    ['PROMPT_CONTEXT:', 'First sentence about the tag.', 'Second sentence about what it does not imply.'].join('\n'),
    {},
  );
  ok(
    res.promptContext === 'First sentence about the tag. Second sentence about what it does not imply.',
    'parse: multi-line PROMPT_CONTEXT is space-joined and trimmed',
  );
}

// --- inline "PROMPT_CONTEXT: <text>" -----------------------------------
{
  const res = parseTagResponse('PROMPT_CONTEXT: Rigid, machine-like groove; no assumed arrangement.', {});
  ok(
    res.promptContext === 'Rigid, machine-like groove; no assumed arrangement.',
    'parse: inline PROMPT_CONTEXT value captured',
  );
}

// --- inline parenthetical (prompt hint pasted back) is not stored ------
{
  const res = parseTagResponse('PROMPT_CONTEXT: (One or two sentences defining what "X" means...)', {});
  ok(res.promptContext === '', 'parse: an inline parenthetical hint is ignored, not stored');
}

// --- own-line "(...)" hint under PROMPT_CONTEXT is skipped -------------
{
  const res = parseTagResponse(
    ['PROMPT_CONTEXT:', '(One or two sentences defining what "X" means and does not imply.)', 'Real definition line.'].join('\n'),
    {},
  );
  ok(res.promptContext === 'Real definition line.', 'parse: "(...)" hint under PROMPT_CONTEXT skipped, real line kept');
}

// --- no PROMPT_CONTEXT at all -> '' (backward compat) -----------------
{
  const res = parseTagResponse(['TITLE:', 'Industrial', 'HASHTAGS:', 'IndustrialMetal, EBM'].join('\n'), {});
  ok(res.promptContext === '', 'parse: promptContext is "" when the response omits the section');
  ok(JSON.stringify(res.title) === JSON.stringify(['Industrial']), 'parse: title parsed');
  ok(JSON.stringify(res.hashtags) === JSON.stringify(['IndustrialMetal', 'EBM']), 'parse: hashtags comma-split + de-hashed');
}

// --- full realistic response with an omitted section -----------------
{
  const res = parseTagResponse(
    [
      'PROMPT_CONTEXT:',
      'Machine-like groove and programmed percussion; no assumed tempo or vocals.',
      '',
      'TITLE:',
      'Industrial',
      'Machine Metal',
      '',
      'THUMBNAIL:',
      'INDUSTRIAL METAL',
      '',
      'DESCRIPTION_TECHNICAL:',
      'Percussion: programmed, rigid, machine-timed.',
      '',
      'DESCRIPTION_LOG:',
      'Rebuilt the groove around a mechanical pulse.',
      '',
      'DESCRIPTION_STATUS:',
      'Groove profile: Mechanical.',
      '',
      'HASHTAGS:',
      'IndustrialMetal',
      'EBM',
      '',
      'SHORTHOOKS_EMOTION:',
      '{song} with a cold machine pulse',
      'Every riff locked to a programmed grid',
      '',
      'SHORTHOOKS_CONTRAST:',
      '{tags.genre} melody over a machine rhythm',
      // Musician / Progress deliberately omitted (would require invented facts)
    ].join('\n'),
    SHORT_HOOK_TYPES,
  );

  ok(res.promptContext.startsWith('Machine-like groove'), 'full: promptContext captured');
  ok(JSON.stringify(res.title) === JSON.stringify(['Industrial', 'Machine Metal']), 'full: title');
  ok(JSON.stringify(res.thumbnail) === JSON.stringify(['INDUSTRIAL METAL']), 'full: thumbnail');
  ok(res.description.technical.length === 1 && res.description.log.length === 1 && res.description.status.length === 1, 'full: description sub-sections');
  ok(JSON.stringify(res.hashtags) === JSON.stringify(['IndustrialMetal', 'EBM']), 'full: hashtags');
  ok(res.shortHooks.emotion.length === 2 && res.shortHooks.contrast.length === 1, 'full: short hooks for present angles');
  ok(!('progress' in res.shortHooks) && !('musician' in res.shortHooks), 'full: omitted angles produce no shortHooks entry');
  ok(res.unrecognized.length === 0, 'full: nothing landed in unrecognized');
}

// --- regression: an OLD-style response (pre-rework) parses unchanged ---
{
  const old = [
    'TITLE:',
    'Machine-Driven Metal Rework',
    'Industrial Metal Reconstruction',
    '',
    'DESCRIPTION_TECHNICAL:',
    'Arrangement: rebuilt around mechanical rhythms.',
    '',
    'SHORTHOOKS_EMOTION:',
    '{decade} nostalgia, now running through distorted guitars and mechanical percussion',
  ].join('\n');
  const res = parseTagResponse(old, SHORT_HOOK_TYPES);
  ok(res.promptContext === '', 'old-style: promptContext ""');
  ok(res.title.length === 2, 'old-style: title lines preserved verbatim');
  ok(res.description.technical.length === 1, 'old-style: description parsed');
  ok(res.shortHooks.emotion.length === 1, 'old-style: short hook parsed');
  ok(res.unrecognized.length === 0, 'old-style: nothing spuriously unrecognized');
}

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
