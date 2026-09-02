// A/B freeze test for the cover-specific Short Hooks prompt refactor.
//
// buildCoverHookPrompt was reimplemented on top of the shared "Copy AI
// Prompt" infrastructure (authorPrompt.js + authorPromptContexts.js). Its
// output was tuned against real covers and must not change. This test holds a
// verbatim copy of the PRE-REFACTOR implementation (legacyBuildCoverHookPrompt
// below) and asserts the new one produces byte-identical output across a
// spread of fixtures that exercise every branch.
//
// No test runner in this project — run with rolldown + node:
//   npx rolldown src/utils/coverPrompt.test.js -f esm -p node -o /tmp/cp.test.mjs \
//     && node /tmp/cp.test.mjs
//
// If cover's prompt is ever deliberately changed, update the legacy copy here
// in the same commit so this stays a true A/B.

import { buildCoverHookPrompt } from './coverPrompt';
import { buildTagPhrase } from '../engine/descriptions/descriptionTagHelpers';
import { buildHookPlaceholders } from './hookPlaceholders';

// ---------------------------------------------------------------------------
// Verbatim copy of coverPrompt.js as of commit d37f973 (before the shared-
// infrastructure refactor). Do not "clean up" — it is the reference.
// ---------------------------------------------------------------------------
function firstNonEmpty(...values) {
  for (const value of values) {
    const trimmed = String(value ?? '').trim();
    if (trimmed) return trimmed;
  }
  return '';
}

function titleCaseKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const HANDLED_OVERRIDE_KEYS = new Set(['storyBlock', 'renovationBlock', 'logBlock']);

function legacyBuildCoverHookPrompt(formData = {}, projectConfig = {}) {
  const artist = (formData.artist || '').trim();
  const song = (formData.song || '').trim();
  const overrides = formData.songBlockOverrides || {};

  const tagLines = (formData.transformationTags || []).map((tag) => {
    const tagConfig = projectConfig?.tags?.[tag] || {};
    const label = tagConfig.label || tag;
    return tagConfig.category ? `${label} (${tagConfig.category})` : label;
  });

  const story = firstNonEmpty(overrides.storyBlock, formData.customStory);
  const renovation = firstNonEmpty(overrides.renovationBlock);
  const logNote = firstNonEmpty(overrides.logBlock, formData.customLogNote);

  const otherOverrides = Object.entries(overrides)
    .filter(
      ([key, value]) =>
        !HANDLED_OVERRIDE_KEYS.has(key) &&
        typeof value === 'string' &&
        value.trim(),
    )
    .map(([key, value]) => `- ${titleCaseKey(key)}: ${value.trim()}`);

  const transformationSummary = buildTagPhrase(formData, projectConfig);
  const placeholders = buildHookPlaceholders(projectConfig).join(', ');

  const context = [
    projectConfig?.promptContext ? `Channel: ${projectConfig.promptContext}` : '',
    artist ? `Artist: ${artist}` : '',
    song ? `Song: ${song}` : '',
    formData.originalYear ? `Original release year: ${String(formData.originalYear).trim()}` : '',
    formData.originalGenre ? `Original genre(s): ${String(formData.originalGenre).trim()}` : '',
    tagLines.length ? `Selected tags (with category): ${tagLines.join(', ')}` : '',
    transformationSummary ? `Transformation summary: ${transformationSummary}` : '',
    formData.signalNumber ? `Signal number: ${String(formData.signalNumber).trim()}` : '',
    formData.useCustomArtistShort && (formData.artistShort || '').trim()
      ? `Artist short name: ${formData.artistShort.trim()}`
      : '',
    (formData.customHashtags || '').trim() ? `Extra hashtags: ${formData.customHashtags.trim()}` : '',
    story ? `Story about this cover: ${story}` : '',
    renovation ? `Renovation / what changed: ${renovation}` : '',
    logNote ? `Log / notes: ${logNote}` : '',
    ...otherOverrides,
  ].filter(Boolean);

  const lines = [
    'I need extra Short Hooks for ONE specific cover-song video. These must be specific to THIS exact cover — a personal reason I covered it, a recording or arrangement detail, something notable about a particular section (e.g. the chorus), a short anecdote, or an in-joke that only makes sense for this version.',
    '',
    'CONTEXT',
    ...context,
    '',
  ];

  if (placeholders) {
    lines.push(
      `PLACEHOLDERS (optional): you may drop any of these tokens into a hook and the app fills them automatically — ${placeholders}. Don't force them; only use one where it reads naturally.`,
      '',
    );
  }

  lines.push(
    'TASK',
    '- Reply with a flat list of 8-12 Short Hooks, one per line. No numbering, no category labels, no headers. I paste this straight into a bulk-add box, so plain lines only.',
    '- Keep each hook SHORT — usually 5-12 words. Prefer one punchy thought over a full explanatory sentence. Compress a Story or Log idea down into a hook; do not summarize it.',
    '- Every line must be specific to THIS exact cover (see CONTEXT). If a line would still make sense for a different song, cut it.',
    "- Do NOT produce generic transformation hooks like \"X but heavier\", \"What if X was punk\", \"X rebuilt as Y\" — the tag/global system already generates those. This pool is only for the cover-specific stuff a reusable system can't know.",
    '- Do NOT invent facts. Only reference a specific song section, instrument, recording/arrangement decision, anecdote, or personal reason if it is explicitly supported by the CONTEXT above.',
    '- Never mention signal numbers, hashtags, or other administrative/channel metadata in a hook — that data is context for you, not material for the hooks.',
    '- Keep them natural and clickable — the kind of thing a person actually says in a short-form video, not marketing filler.',
    '- Do NOT end a hook with a period. Internal punctuation is fine — "Every road is a question. This was my answer" is good, just no final ".".',
    '',
    'Tone and length to aim for (illustrative only — write fresh hooks for the cover above, do not reuse these):',
    '- Мельница gave it mythology. I gave it scars',
    '- Дороги, somewhere after the Collapse',
    '- Same journey. Rougher roads',
  );

  return lines.join('\n').trimEnd();
}
// ---------------------------------------------------------------------------

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
  promptContext:
    'Test Channel reworks existing songs into darker versions, framed as a post-apocalyptic broadcast series.',
  tags: {
    heavier: { label: 'Heavier', category: 'energy' },
    darker: { label: 'Darker', category: 'mood' },
  },
};

const fixtures = {
  'full — every field, block overrides win over legacy, extra swept key': {
    projectConfig,
    formData: {
      artist: 'Мельница',
      song: 'Дороги',
      originalYear: ' 2005 ',
      originalGenre: 'Folk Rock, Pagan Folk',
      transformationTags: ['heavier', 'darker'],
      signalNumber: '07',
      useCustomArtistShort: true,
      artistShort: ' MLN ',
      customHashtags: '  #folkmetal #rerecord  ',
      songBlockOverrides: {
        storyBlock: 'First heard it on a long night drive after the funeral.',
        renovationBlock: 'Second half rebuilt around a doom riff; drums are half-time.',
        logBlock: 'Take 4. Kept the cracked vocal at 2:41.',
        philosophyLine: 'Every road is a question.',
        gearBlock: { items: [{ label: 'Guitar', text: 'ignored — not a string' }] },
      },
      customStory: 'legacy story (should be ignored)',
      customLogNote: 'legacy log (should be ignored)',
    },
  },

  'empty formData': { projectConfig, formData: {} },

  'empty formData, no projectConfig': { projectConfig: undefined, formData: {} },

  'partial — artist + song only, no promptContext, no tags': {
    projectConfig: { tags: {} },
    formData: { artist: 'The Offspring', song: 'Gone Away' },
  },

  'legacy-only story/log (no block overrides for them)': {
    projectConfig,
    formData: {
      artist: 'a',
      song: 'b',
      customStory: 'legacy story text',
      customLogNote: 'legacy log text',
      songBlockOverrides: { renovationBlock: 'only renovation is set' },
    },
  },

  'tag not in config — label falls back to key, no category': {
    projectConfig: { promptContext: 'x', tags: {} },
    formData: { artist: 'a', song: 'b', transformationTags: ['mystery_tag'] },
  },

  'three tags — transformation summary uses comma + "and"': {
    projectConfig,
    formData: {
      artist: 'a',
      song: 'b',
      transformationTags: ['heavier', 'darker', 'unknown'],
    },
  },
};

for (const [name, { projectConfig: pc, formData }] of Object.entries(fixtures)) {
  const expected = legacyBuildCoverHookPrompt(formData, pc);
  const actual = buildCoverHookPrompt(formData, pc);
  if (actual !== expected) {
    // Show the first divergence to make a failure debuggable.
    const a = actual.split('\n');
    const b = expected.split('\n');
    const i = a.findIndex((line, idx) => line !== b[idx]);
    console.error(`  line ${i}:`);
    console.error(`    new: ${JSON.stringify(a[i])}`);
    console.error(`    old: ${JSON.stringify(b[i])}`);
  }
  assert(actual === expected, `byte-identical to pre-refactor output — ${name}`);
}

// Sanity: the fixtures actually exercised the interesting branches.
{
  const full = buildCoverHookPrompt(fixtures['full — every field, block overrides win over legacy, extra swept key'].formData, projectConfig);
  assert(full.includes('- Philosophy Line: Every road is a question.'), 'sanity: extra songBlockOverrides key is swept in generically');
  assert(!full.includes('ignored — not a string'), 'sanity: non-string override value is skipped');
  assert(full.includes('Story about this cover: First heard it'), 'sanity: block override wins over legacy customStory');
  assert(full.includes('Original release year: 2005') && !full.includes(' 2005 '), 'sanity: values are trimmed');
  assert(full.includes('Selected tags (with category): Heavier (energy), Darker (mood)'), 'sanity: tag lines carry category');
}

if (failures > 0) {
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
