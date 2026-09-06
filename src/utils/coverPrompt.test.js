// A/B guard for the cover-specific Short Hooks prompt.
//
// buildCoverHookPrompt runs on the shared "Copy AI Prompt" infrastructure
// (authorPrompt.js + authorPromptContexts.js). This test holds a standalone
// inline copy of the expected implementation (referenceBuildCoverHookPrompt
// below) and asserts the real one produces byte-identical output across a
// spread of fixtures that exercise every branch. It started as a
// pre-refactor freeze; the reference is now updated in lock-step whenever the
// cover prompt is deliberately changed, so it stays a structural-equivalence
// guard (wrapper == inline reference), not a historical snapshot.
//
// No test runner in this project — run with rolldown + node:
//   npx rolldown src/utils/coverPrompt.test.js -f esm -p node -o /tmp/cp.test.mjs \
//     && node /tmp/cp.test.mjs
//
// Any deliberate change to the cover prompt must be mirrored into the
// reference copy below in the same commit.

import { buildCoverHookPrompt } from './coverPrompt';
import { buildTagPhrase } from '../engine/descriptions/descriptionTagHelpers';
import { buildHookPlaceholders } from './hookPlaceholders';

// ---------------------------------------------------------------------------
// Inline reference implementation. Kept byte-for-byte in step with
// authorPromptContexts.js's coverShortHooksContext — do not "clean up".
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

// Literal copies of authorPromptContexts.js's defaults — kept independent of
// the real exports on purpose (see the file header above): this reference
// must diverge visibly if someone edits the real constants without updating
// this file, not silently track them via an import.
const REFERENCE_COVER_INTRO =
  'I need extra Short Hooks for ONE specific cover-song video. These must be specific to THIS exact cover — a personal reason I covered it, a recording or arrangement detail, something notable about a particular section (e.g. the chorus), a short anecdote, or an in-joke that only makes sense for this version.';

const REFERENCE_COVER_TASK_BULLETS = [
  'Reply with a flat list of Short Hooks, one per line — as many as are genuinely strong and distinct. A handful of sharp ones beats a padded list; never invent filler to reach a number. No numbering, no category labels, no headers. I paste this straight into a bulk-add box, so plain lines only.',
  'Keep each hook SHORT — usually 5-12 words. Prefer one punchy thought over a full explanatory sentence.',
  'Pick the few genuinely worth-saying angles from the context — a true detail is not automatically a good hook.',
  'A hook earns its place only if it gives a viewer a concrete reason to watch: a specific curiosity the context supports, a recognizable feeling, or a musical detail someone would want to hear.',
  "Don't turn one feeling into several reworded lines. Adding the song's name does not make a generic statement cover-specific.",
  'Avoid abstract therapy/lore slogans and overblown drama.',
  'Recording history, DAW/software upgrades, and personal-progress notes are useful context but rarely good hooks on their own — use one only if it genuinely intrigues.',
  'Every line must be specific to THIS exact cover (see CONTEXT). Ground every hook in a supplied fact or personal connection about this cover. That fact does not have to be unique to this song across all music. Reject interchangeable filler; adding the song name alone does not establish specificity.',
  'Do NOT produce generic transformation hooks like "X but heavier", "What if X was punk", "X rebuilt as Y" — the tag/global system already generates those. This pool is only for the cover-specific stuff a reusable system can\'t know.',
  'Do NOT use the {transformation} placeholder in a hook — these hooks are about this specific cover, not its transformation style (the tag/global system covers that).',
  'Do NOT invent facts. Only reference a specific song section, instrument, recording/arrangement decision, anecdote, or personal reason if it is explicitly supported by the CONTEXT above. Do not imply a before/after comparison, a reveal, or a payoff unless the CONTEXT explicitly says the video delivers one.',
  'A faithful cover can still have real, mentionable production or performance changes (re-recorded vocals, new drums, a new mix) — use one as hook material when the CONTEXT states it; being faithful does not forbid naming a real change.',
  'A hook may be tied to one specific section (e.g. the chorus) only if the CONTEXT supports it — never generalize a section-specific detail into a claim about the whole song.',
  'Cover context is the primary source of truth. A clearly factual detail from the existing notes may supplement it. Do not treat an ambiguous or in-universe SIGNAL-fiction-sounding line as an established fact, and do not assume a note is fiction just because it sounds dramatic or because this channel sometimes uses lore.',
  "Rely only on what's actually supported. If Cover context is empty and the existing notes are only ambiguous or lore-flavored, returning fewer hooks — or none — is correct; never invent a detail to reach a number.",
  'Never mention signal numbers, hashtags, or other administrative/channel metadata in a hook — that data is context for you, not material for the hooks.',
  'Keep them natural and clickable — the kind of thing a person actually says in a short-form video, not marketing filler.',
  'Do NOT end a hook with a period. Internal punctuation is fine — "Every road is a question. This was my answer" is good, just no final ".".',
  'If the CONTEXT above does not support even one worthwhile cover-specific hook, reply with exactly NONE on a single line and nothing else — no explanation, no apology, no placeholder line.',
];

function referenceBuildCoverHookPrompt(formData = {}, projectConfig = {}) {
  const artist = (formData.artist || '').trim();
  const song = (formData.song || '').trim();
  const overrides = formData.songBlockOverrides || {};

  // AI Prompts settings editor override (src/utils/aiPromptOverrides.js) —
  // mirrors authorPromptContexts.js's coverShortHooksContext exactly.
  const promptOverride = projectConfig?.aiPromptOverrides?.coverHooks;
  const intro = promptOverride?.intro ?? REFERENCE_COVER_INTRO;
  const taskBullets = promptOverride?.taskBullets ?? REFERENCE_COVER_TASK_BULLETS;

  const tagLines = (formData.transformationTags || []).map((tag) => {
    const tagConfig = projectConfig?.tags?.[tag] || {};
    const label = tagConfig.label || tag;
    return tagConfig.category ? `${label} (${tagConfig.category})` : label;
  });

  const coverContext = (formData.coverContext || '').trim();
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

  const notesLines = [
    story ? `Story about this cover: ${story}` : '',
    renovation ? `Renovation / what changed: ${renovation}` : '',
    logNote ? `Log / notes: ${logNote}` : '',
  ].filter(Boolean);

  const context = [
    projectConfig?.promptContext ? `Channel: ${projectConfig.promptContext}` : '',
    artist ? `Artist: ${artist}` : '',
    song ? `Song: ${song}` : '',
    formData.originalYear ? `Original release year: ${String(formData.originalYear).trim()}` : '',
    formData.originalGenre ? `Original genre(s): ${String(formData.originalGenre).trim()}` : '',
    tagLines.length ? `Selected tags (with category): ${tagLines.join(', ')}` : '',
    transformationSummary ? `Transformation summary: ${transformationSummary}` : '',
    coverContext
      ? `Cover context (factual — the personal & recording story behind THIS cover; the primary source of truth for anything specific): ${coverContext}`
      : '',
    formData.signalNumber ? `Signal number: ${String(formData.signalNumber).trim()}` : '',
    formData.useCustomArtistShort && (formData.artistShort || '').trim()
      ? `Artist short name: ${formData.artistShort.trim()}`
      : '',
    (formData.customHashtags || '').trim() ? `Extra hashtags: ${formData.customHashtags.trim()}` : '',
    notesLines.length
      ? [
          'Existing notes (mixed — some factual, some may be in-universe SIGNAL fiction; a clearly factual detail may supplement the Cover context above, but do not treat an ambiguous or lore-flavored line as established fact):',
          ...notesLines,
        ].join('\n')
      : '',
    ...otherOverrides,
  ].filter(Boolean);

  const lines = [
    intro,
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

  lines.push('TASK', ...taskBullets.map((bullet) => `- ${bullet}`));

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
      coverContext: '  I picked this one because the chord progression always got stuck in my head.  ',
    },
  },

  'empty formData': { projectConfig, formData: {} },

  'cover context blank, lore-heavy story — mixed framing, no forced count, NONE rule present': {
    projectConfig,
    formData: {
      artist: 'a',
      song: 'b',
      songBlockOverrides: { storyBlock: 'The wasteland signal calls again through the ruins.' },
    },
  },

  'AI Prompts override — intro only (taskBullets stays default)': {
    projectConfig: {
      ...projectConfig,
      aiPromptOverrides: { coverHooks: { intro: 'CUSTOM INTRO TEXT ONLY.' } },
    },
    formData: { artist: 'a', song: 'b' },
  },

  'AI Prompts override — taskBullets only (intro stays default)': {
    projectConfig: {
      ...projectConfig,
      aiPromptOverrides: { coverHooks: { taskBullets: ['Custom rule one.', 'Custom rule two.'] } },
    },
    formData: { artist: 'a', song: 'b' },
  },

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
  const expected = referenceBuildCoverHookPrompt(formData, pc);
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
  assert(actual === expected, `matches the inline reference — ${name}`);
}

// Sanity: the fixtures actually exercised the interesting branches.
{
  const full = buildCoverHookPrompt(fixtures['full — every field, block overrides win over legacy, extra swept key'].formData, projectConfig);
  assert(full.includes('- Philosophy Line: Every road is a question.'), 'sanity: extra songBlockOverrides key is swept in generically');
  assert(!full.includes('ignored — not a string'), 'sanity: non-string override value is skipped');
  assert(full.includes('Story about this cover: First heard it'), 'sanity: block override wins over legacy customStory');
  assert(full.includes('Original release year: 2005') && !full.includes(' 2005 '), 'sanity: values are trimmed');
  assert(full.includes('Selected tags (with category): Heavier (energy), Darker (mood)'), 'sanity: tag lines carry category');
  assert(
    full.includes('Do NOT use the {transformation} placeholder in a hook'),
    'sanity: cover TASK forbids the {transformation} placeholder in new hooks',
  );

  // ---- Step 5 revision checks ----
  assert(
    full.includes('Ground every hook in a supplied fact or personal connection about this cover'),
    'sanity: specificity is grounded in a supplied fact/personal connection, not a cross-song-uniqueness test',
  );
  assert(
    full.includes('That fact does not have to be unique to this song across all music'),
    'sanity: a hook is not disqualified just because a similar fact could apply to another song',
  );
  assert(!full.includes('would still make sense for a different song'), 'sanity: the old cross-song-uniqueness test is gone');
  assert(
    full.includes('Cover context (factual') && full.includes('the chord progression always got stuck in my head.'),
    'sanity: Cover context line present and trimmed when set',
  );
  assert(!full.includes('  I picked this one'), 'sanity: Cover context leading whitespace is trimmed');
  {
    const coverContextIdx = full.indexOf('Cover context (factual');
    const notesIdx = full.indexOf('Existing notes (mixed');
    assert(
      coverContextIdx !== -1 && notesIdx !== -1 && coverContextIdx < notesIdx,
      'sanity: Cover context line is placed ahead of the Existing notes block',
    );
  }
  assert(
    full.includes(
      'Existing notes (mixed — some factual, some may be in-universe SIGNAL fiction; a clearly factual detail may supplement the Cover context above, but do not treat an ambiguous or lore-flavored line as established fact):',
    ),
    'sanity: existing-notes framing reads supplement-when-factual, not blanket mixed-fiction',
  );
  assert(!full.includes('8-12'), 'sanity: the forced 8-12 hook count is gone');
  assert(!full.includes('Tone and length to aim for'), 'sanity: illustrative examples heading is gone entirely, not just emptied');
  assert(!full.includes('Мельница gave it mythology'), 'sanity: the old illustrative example lines are gone');
  assert(
    full.includes('reply with exactly NONE on a single line and nothing else'),
    'sanity: the zero-supported-hook NONE sentinel rule is present',
  );
  assert(
    full.includes('Pick the few genuinely worth-saying angles from the context'),
    'sanity: objective shifted to selecting angles, not compressing the story',
  );
  assert(!full.includes('Compress a Story or Log idea down into a hook'), 'sanity: the old compress-the-story instruction is gone');
  assert(
    full.includes('DAW/software upgrades, and personal-progress notes are useful context but rarely good hooks'),
    'sanity: recording history/software-upgrade/progress notes are not auto-promoted to hooks',
  );
  assert(
    full.includes('A faithful cover can still have real, mentionable production or performance changes'),
    'sanity: Faithful covers can still name real production/performance changes',
  );
  assert(
    full.includes('A hook may be tied to one specific section') && full.includes('never generalize a section-specific detail'),
    'sanity: per-Short section scope is preserved',
  );

  // A cover with no Cover Context and only a lore-heavy note still gets the
  // same static rules (they don't depend on formData) — confirms the
  // guidance isn't accidentally conditional on coverContext being set.
  const loreOnly = buildCoverHookPrompt(
    fixtures['cover context blank, lore-heavy story — mixed framing, no forced count, NONE rule present'].formData,
    projectConfig,
  );
  assert(!loreOnly.includes('Cover context (factual'), 'sanity: no Cover context line when formData.coverContext is unset');
  assert(loreOnly.includes('Story about this cover: The wasteland signal calls again'), 'sanity: lore-heavy story still surfaced as a lead, not filtered out');
  assert(!loreOnly.includes('8-12'), 'sanity: no forced count even in the lore-only case');
  assert(
    loreOnly.includes('reply with exactly NONE on a single line and nothing else'),
    'sanity: NONE sentinel rule present even when Cover Context is empty',
  );

  // ---- AI Prompts settings editor override checks ----
  const introOverridden = buildCoverHookPrompt(
    fixtures['AI Prompts override — intro only (taskBullets stays default)'].formData,
    fixtures['AI Prompts override — intro only (taskBullets stays default)'].projectConfig,
  );
  assert(introOverridden.includes('CUSTOM INTRO TEXT ONLY.'), 'sanity: overridden intro appears verbatim');
  assert(
    !introOverridden.includes('I need extra Short Hooks for ONE specific cover-song video'),
    'sanity: the real default intro is absent when intro is overridden',
  );
  assert(
    introOverridden.includes('Pick the few genuinely worth-saying angles from the context'),
    'sanity: overriding only intro leaves the default TASK bullets untouched (field independence)',
  );

  const bulletsOverridden = buildCoverHookPrompt(
    fixtures['AI Prompts override — taskBullets only (intro stays default)'].formData,
    fixtures['AI Prompts override — taskBullets only (intro stays default)'].projectConfig,
  );
  assert(
    bulletsOverridden.includes('- Custom rule one.') && bulletsOverridden.includes('- Custom rule two.'),
    'sanity: overridden taskBullets appear verbatim',
  );
  assert(
    !bulletsOverridden.includes('Pick the few genuinely worth-saying angles from the context'),
    'sanity: the real default TASK bullets are absent when taskBullets is overridden',
  );
  assert(
    bulletsOverridden.includes('I need extra Short Hooks for ONE specific cover-song video'),
    'sanity: overriding only taskBullets leaves the default intro untouched (field independence)',
  );

  // Every earlier fixture in the A/B loop above sets no aiPromptOverrides at
  // all, and already asserted byte-identical to the reference — that is the
  // regression guarantee that unoverridden output is unchanged by this feature.
}

if (failures > 0) {
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
