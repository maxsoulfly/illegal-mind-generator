// Per-editor context adapters for the shared "Copy AI Prompt" helper. Each
// function turns (projectConfig, editorState) into the ordered `sections`
// array that authorPrompt.js's buildAuthorPrompt assembles. Keeping the
// wording here — one adapter per pool — is what lets the skeleton stay dumb
// and every prompt stay consistent without a duplicated builder per editor.
//
// One-way only, matching the buildXPrompt convention across this codebase:
// no parse-back, the editor's Bulk Add box is the return path.
//
// NOTE ON THE COVER ADAPTER: coverPrompt.test.js keeps a full copy of this
// adapter's expected output as an A/B guard — the wrapper (buildCoverHookPrompt)
// must equal that inline reference. It was tuned against real covers, so do
// not "tidy" its wording casually; any deliberate change to the cover prompt
// must be mirrored into that test's copy in the same commit.

import { buildTagPhrase } from '../engine/descriptions/descriptionTagHelpers';
import { buildHookPlaceholders } from './hookPlaceholders';
import { buildAuthorPrompt, placeholderNote, RULE } from './authorPrompt';
import { SCOPE_OPTIONS, TARGET_OPTIONS } from './customBlocks';

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

// songBlockOverrides keys the cover adapter surfaces under their own labels;
// everything else non-empty is swept in generically as "- Label: value".
const COVER_HANDLED_OVERRIDE_KEYS = new Set(['storyBlock', 'renovationBlock', 'logBlock']);

const COVER_INTRO =
  'I need extra Short Hooks for ONE specific cover-song video. These must be specific to THIS exact cover — a personal reason I covered it, a recording or arrangement detail, something notable about a particular section (e.g. the chorus), a short anecdote, or an in-joke that only makes sense for this version.';

// Revised 2026-09-06 (Step 5 of the Cover Context plan): dropped the forced
// 8-12 count, shifted the objective from "compress the story" to "select
// worthwhile audience-facing angles", added the Cover-Context-is-primary /
// existing-notes-supplement rules, and removed the illustrative examples
// entirely (COVER_EXAMPLES/COVER_EXAMPLES_HEADING deleted, not just emptied).
// Mirror any further change into coverPrompt.test.js's inline reference in
// the same commit — see the note at the top of this file.
const COVER_TASK_BULLETS = [
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

// Builds the section array for buildCoverHookPrompt. Mirrored by an A/B guard
// in coverPrompt.test.js — see the note at the top of this file.
export function coverShortHooksContext(projectConfig = {}, formData = {}) {
  const artist = (formData.artist || '').trim();
  const song = (formData.song || '').trim();
  const overrides = formData.songBlockOverrides || {};

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
        !COVER_HANDLED_OVERRIDE_KEYS.has(key) &&
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

  const placeholderLine = placeholders
    ? `PLACEHOLDERS (optional): you may drop any of these tokens into a hook and the app fills them automatically — ${placeholders}. Don't force them; only use one where it reads naturally.`
    : null;

  return [
    COVER_INTRO,
    ['CONTEXT', ...context].join('\n'),
    placeholderLine,
    ['TASK', ...COVER_TASK_BULLETS.map((bullet) => `- ${bullet}`)].join('\n'),
  ];
}

// ─── Tag Short Hooks ─────────────────────────────────────────────────────────
// One transformation tag, one hook category (angle). Two authoritative
// concepts, surfaced as two labelled sections:
//   TAG MEANING — the tag's promptContext (Tag Basics → "What this tag
//     means"). Constrains the CONTENT so it stays accurate; NOT the tag's
//     existing phrases, which may be exactly what the user is fixing.
//   HOOK ANGLE — the category's UI-authored aiContext (Project Settings →
//     Short Hooks). Decides what KIND of line to write — its shape, subject,
//     what it asks. Only emitted when aiContext is non-blank; never inferred
//     from the category name.
// The angle governs the line's form; the tag meaning governs its accuracy —
// the tag is not automatically the subject. No branch keys off any specific
// tag or category name (that is the systemic fix for e.g. Faithful +
// Discussion). Existing phrases are sent only for de-duping and as a "don't
// imitate the weak ones" reference.

const TAG_SHORT_HOOK_INTRO =
  'I need more Short Hooks for ONE transformation tag, in ONE specific hook category (angle). A Short Hook is a single line read aloud as a short-form-video hook and also mixed into video titles, so each one has to work on its own.';

export function tagShortHooksContext(projectConfig = {}, opts = {}) {
  const { tag = {}, hookCategoryKey = '', hookCategoryLabel = '', phrases = [] } = opts;

  const label = String(tag.label || tag.name || '').trim();
  const category = String(tag.category || '').trim();
  const meaning = String(tag.promptContext || '').trim();

  const angleConfig = projectConfig?.shortHookTypes?.[hookCategoryKey] || {};
  const angleLabel = String(hookCategoryLabel || angleConfig.label || hookCategoryKey || '').trim();
  // Optional, UI-authored (Project Settings → Short Hooks). Blank -> no HOOK
  // ANGLE section and no angle-authority language; never inferred from the
  // category name.
  const angleAiContext = String(angleConfig.aiContext || '').trim();
  const angleExamples = (angleConfig.templates || [])
    .filter((t) => typeof t === 'string' && t.trim())
    .slice(0, 2);

  const context = [
    projectConfig?.promptContext ? `Channel: ${projectConfig.promptContext}` : '',
    label ? `Tag: ${label}${category ? ` (category: ${category})` : ''}` : '',
    angleLabel ? `Hook category / angle: ${angleLabel}` : '',
    angleExamples.length
      ? `This angle's general shape (project-wide examples, any tag — for pattern only, not tag-specific): ${angleExamples
          .map((example) => `"${example}"`)
          .join(' / ')}`
      : '',
  ].filter(Boolean);

  const meaningBody = meaning
    ? meaning
    : '(not set — infer ONLY from the tag name and category above, and do not assume it changes tempo, heaviness, instrumentation, or anything else it does not state).';
  const tagMeaningSection = [
    'TAG MEANING',
    label ? `${label}: ${meaningBody}` : meaningBody,
  ].join('\n');

  // Only when the category has an authored aiContext. The framing sentence is
  // deliberately generic — it never names a tag or a category.
  const angleSection = angleAiContext
    ? [
        'HOOK ANGLE',
        angleLabel ? `${angleLabel}: ${angleAiContext}` : angleAiContext,
        '',
        'The HOOK ANGLE decides what kind of line to write — its shape, its subject, what it asks. The TAG MEANING constrains the content so it stays accurate, but the tag is not automatically the subject: a hook only needs to be about the tag itself when the HOOK ANGLE calls for that.',
      ].join('\n')
    : '';

  const existingSection =
    phrases.length > 0
      ? [
          'EXISTING HOOKS for this tag + this angle (do not repeat or lightly reword them; "TAG MEANING" above is the source of truth — if one of these is vague, generic, or implies something the tag meaning does not, do NOT imitate it):',
          ...phrases.map((phrase) => `- ${phrase}`),
        ].join('\n')
      : '';

  const rules = [
    RULE.PLAIN_LINES,
    'Give me 8-12 new hooks.',
    `Every hook must fit BOTH this exact tag (${label || 'the tag above'}) and this exact angle (${
      angleLabel || 'the angle above'
    }) — if a line would also work for a different tag or a different angle, cut it.`,
    angleAiContext
      ? 'Follow the HOOK ANGLE above for what kind of line this is; use the TAG MEANING to keep the content accurate, not to force the tag to become what the hook is about.'
      : '',
    'Stay strictly within "TAG MEANING". Do not assume the tag implies a tempo change, more heaviness, particular instruments, or a production/technique change unless the meaning explicitly says so.',
    RULE.SHORT_HOOK_LENGTH,
    "Use placeholders where the angle naturally calls for them, matching the pattern of this angle's examples: {artist}/{song} for song-focused angles, {years}/{currentYear} for growth-focused angles (e.g. Progress, Musician). Don't force a placeholder where it doesn't read naturally.",
    'Do NOT use the {transformation} placeholder — this pool is already scoped to one tag, so write the idea in plain words (or a typed token like {tags.genre}/{tags.energy} only where it genuinely fits). If an example above uses {transformation}, ignore that part of it.',
    RULE.NO_GENERIC_FILLER,
    RULE.NO_CHANNEL_METADATA,
    RULE.SHORT_HOOK_NO_PERIOD,
    RULE.SHORT_HOOK_NATURAL,
  ].filter(Boolean);

  return [
    TAG_SHORT_HOOK_INTRO,
    ['CONTEXT', ...context].join('\n'),
    tagMeaningSection,
    angleSection,
    existingSection,
    placeholderNote(buildHookPlaceholders(projectConfig)),
    ['TASK', ...rules.map((rule) => `- ${rule}`)].join('\n'),
  ];
}

export function buildTagShortHooksPrompt(projectConfig, opts) {
  return buildAuthorPrompt(tagShortHooksContext(projectConfig, opts));
}

// ─── Global (base) Short Hook types ──────────────────────────────────────────
// A project-level Short Hook pool for one angle (Nostalgia, Emotion,
// Transformation, ...). Unlike tag hooks, these lines are mixed into MANY
// different covers' shorts titles/hooks, so a line must read naturally for
// any cover where the angle applies — and the existing templates ARE the
// house voice, so imitating their tone is correct here (the opposite of the
// tag adapter). Config: description.shortHookTypes / Project Settings →
// Short Hooks.

const GLOBAL_SHORT_HOOK_INTRO =
  'I need more project-wide Short Hooks for ONE angle. These lines are mixed into the shorts titles and hooks of many different cover videos, so each one has to read naturally for ANY cover where this angle applies — not one specific song, artist, or style.';

// Because base lines are reused across every cover, placeholder VALUES vary
// wildly at generation time. {primaryTag} in particular has no fixed
// semantic type — it can resolve to a genre, a tempo word, an adjective, a
// mood, a language, an era — so the AI must be told not to drop it into a
// slot that assumes one type ("went {primaryTag}", "a {primaryTag} version").
// Category tokens ({tags.genre}, {tags.tempo}, ...) are typed and safe for
// typed slots. Authoring-prompt guidance only; the engine is unchanged.
const GLOBAL_PLACEHOLDER_TYPES = [
  'PLACEHOLDER TYPES',
  'Placeholders resolve to real values at generation time and each has a semantic type — put each one only where its type fits the sentence grammar.',
  '- {primaryTag} is NOT type-safe: it becomes whichever transformation tag is first for a given cover, which may be a genre (punk, metal), a tempo word (faster, slower), an energy word (heavier), a mood (darker), a language (russian), or an era (90s). Never use it in a slot that assumes a type — "went {primaryTag}", "became {primaryTag}", "a {primaryTag} version" all break on values like "faster", "russian", or "90s".',
  '- When a slot genuinely needs one type, use a category token whose type is fixed: {tags.genre} (punk / metal / hardcore ...), {tags.tempo} (faster / slower), {tags.energy} (heavier ...), {tags.mood} (darker ...), {tags.production} (modernized ...), {tags.era} (90s / 00s), {tags.lang}. Any of these resolves to nothing when no tag of that category is selected — and the app then drops the whole line — so only use one where the line is worthless without that value.',
  '- {transformation} appears in some existing lines but must NOT be used in a new one (see TASK) — it only produces more "{song} + connector + {transformation}" phrasings.',
].join('\n');

export function globalShortHookContext(projectConfig = {}, opts = {}) {
  const { hookTypeKey = '', hookConfig = {} } = opts;

  const label = String(hookConfig.label || hookTypeKey || '').trim();
  // Optional, UI-authored (Project Settings → Short Hooks). Never seeded from
  // config and never inferred from the category name — when blank, the prompt
  // is byte-identical to before this field existed.
  const aiContext = String(hookConfig.aiContext || '').trim();
  const templates = (hookConfig.templates || []).filter(
    (t) => typeof t === 'string' && t.trim(),
  );

  const flagLines = [];
  if (hookConfig.excludeForFaithful) {
    flagLines.push(
      'This angle only runs when the cover is a rework/transformation — it is skipped for faithful covers and original songs, so a line may assume the song was changed in some way.',
    );
  }
  if (hookConfig.requiresGenre) {
    flagLines.push(
      "This angle only runs when the song's original genre is known — a line may use {originalGenre}.",
    );
  }

  const context = [
    projectConfig?.promptContext ? `Channel: ${projectConfig.promptContext}` : '',
    label
      ? `Short Hook angle: ${label}${
          hookTypeKey && hookTypeKey !== label ? ` (key: ${hookTypeKey})` : ''
        }`
      : '',
    aiContext
      ? `Angle purpose (authoritative — what this category is for): ${aiContext}`
      : '',
    ...flagLines,
    templates.length === 0
      ? "This angle currently has no lines — you're establishing its voice from scratch."
      : '',
  ].filter(Boolean);

  const existingSection =
    templates.length > 0
      ? [
          aiContext
            ? 'CURRENT LINES for this angle (match their tone and phrasing and do not repeat or lightly reword any of them — but "Angle purpose" above is the source of truth: if a line here reads off-purpose, do not imitate it; also do not use {transformation}, even if some of these do):'
            : 'CURRENT LINES for this angle (this is the established house voice — match its tone and phrasing, and do not repeat or lightly reword any of them; but do not use {transformation}, even if some of these do):',
          ...templates.map((template) => `- ${template}`),
        ].join('\n')
      : '';

  const rules = [
    RULE.PLAIN_LINES,
    'Give me 8-12 new lines.',
    aiContext
      ? 'Write lines that serve "Angle purpose" above — that is the authoritative definition of what this category is for. Do not drift into a different kind of line because it sounds plausible for the category name.'
      : '',
    `Every line must work for ANY cover where the "${
      label || 'this'
    }" angle applies — never tied to one specific song, artist, genre, or transformation tag.`,
    'Lean on placeholders so a line stays reusable: {artist}, {song}, {originalGenre}, {years}, {decade}. A line with no placeholder still has to be fully generic.',
    'Do NOT use {transformation} in any new line — it just yields near-duplicate "{song} + connector + {transformation}" sentences, and I want genuinely authored hooks with varied structure. If a line needs to name the change, use a typed category token where its type fits ({tags.genre}, {tags.energy}, {tags.tempo}, {tags.mood}, {tags.production}) or state it plainly.',
    'Follow the PLACEHOLDER TYPES notes above — in particular, never put {primaryTag} in a slot that assumes a genre, tempo, mood, or adjective.',
    templates.length > 0 ? 'Match the tone and phrasing of the current lines above.' : '',
    RULE.SHORT_HOOK_LENGTH,
    'No empty mood-words — "Pure energy", "Feel it", "This one hits" say nothing on their own. Even a generic line needs a real hook, question, or claim.',
    RULE.NO_CHANNEL_METADATA,
    RULE.SHORT_HOOK_NO_PERIOD,
    RULE.SHORT_HOOK_NATURAL,
  ].filter(Boolean);

  return [
    GLOBAL_SHORT_HOOK_INTRO,
    ['CONTEXT', ...context].join('\n'),
    existingSection,
    placeholderNote(buildHookPlaceholders(projectConfig)),
    GLOBAL_PLACEHOLDER_TYPES,
    ['TASK', ...rules.map((rule) => `- ${rule}`)].join('\n'),
  ];
}

export function buildGlobalShortHookPrompt(projectConfig, opts) {
  return buildAuthorPrompt(globalShortHookContext(projectConfig, opts));
}

// ─── Title template pools ───────────────────────────────────────────────────
// One title template group (Standard / But It's / Generic — Project Settings
// → Titles). A template is filled and reused as the video title for many
// covers, so it is placeholder-driven and must read for any cover. Prefix /
// suffix pools are single-value config fields, not candidate pools — they are
// out of scope for the Copy AI Prompt helper.

const TITLE_POOL_INTRO =
  'I need more title templates for ONE title pool. A template here is filled in with placeholder values and reused as the video title for many different cover songs, so each one has to read well for ANY cover it could apply to.';

// Role of each JSON-default pool. A user-added pool key falls through to no
// role line (its existing templates + the pool label carry the intent).
// NOTE: new suggestions must NOT use {transformation} (see the TASK rules) —
// the existing templates already over-use it and it only yields more
// "{song} + connector + {transformation}" variations. Roles describe the
// pool's intent without instructing the AI to reach for that token.
const TITLE_POOL_ROLES = {
  standard:
    'The main title format: it names the song (artist and/or song title) and signals that this is a rework. The existing templates build that around {transformation}; for NEW suggestions I want structures that do NOT use {transformation} (see TASK).',
  butIts:
    'The "but it\'s ___" reframe. It is skipped automatically for faithful covers and original songs, so it may assume a real change was made. The existing templates put {transformation} in the "it\'s ___" slot; for NEW suggestions fill that slot another way (a typed category placeholder, {originalGenre}, or a concrete word) and vary the framing — I already have plenty of plain "{song} but it\'s ___".',
  generic:
    'Standalone / branded titles that do not depend on the selected tags. Room to be creative or channel-flavoured, but each one still has to work for any cover.',
};

const TITLE_PLACEHOLDER_TYPES = [
  'PLACEHOLDER TYPES',
  'Each placeholder resolves to a real value when the title is generated, and each has a semantic type — only use one where its type fits the grammar of the template.',
  '- {transformation} appears in the EXISTING templates but must NOT be used in any new suggestion (see TASK) — it only produces more "{song} + connector + {transformation}" phrasings.',
  '- {primaryTag} is NOT type-safe: it resolves to whichever transformation tag is first for a cover, which may be a genre (punk, metal), a tempo word (faster, slower), an energy word (heavier), a mood (darker), a language (russian), or an era (90s). Never put it in a slot that assumes a type — "{artist} goes {primaryTag}", "a {primaryTag} version of {song}" break on values like "faster", "russian", or "90s".',
  '- For a slot that needs a specific kind of word, use a typed category token: {tags.genre} (punk / metal / hardcore ...), {tags.energy} (heavier ...), {tags.tempo} (faster / slower), {tags.mood} (darker ...), {tags.production} (modernized ...), {tags.era} (90s / 00s). Each resolves to nothing when no tag of that category is selected — the app then drops that title candidate — so only use one where the title is pointless without it.',
].join('\n');

export function titlePoolContext(projectConfig = {}, opts = {}) {
  const { groupName = '', groupLabel = '', templates = [] } = opts;

  const label = String(groupLabel || groupName || '').trim();
  const cleanTemplates = (templates || []).filter(
    (t) => typeof t === 'string' && t.trim(),
  );
  const role = TITLE_POOL_ROLES[groupName] || '';

  const context = [
    projectConfig?.promptContext ? `Channel: ${projectConfig.promptContext}` : '',
    label
      ? `Title pool: ${label}${groupName && groupName !== label ? ` (key: ${groupName})` : ''}`
      : '',
    role ? `What this pool is for: ${role}` : '',
  ].filter(Boolean);

  const existingSection =
    cleanTemplates.length > 0
      ? [
          'CURRENT TEMPLATES in this pool (tone reference only — do not reword these, and do not use {transformation} the way they do):',
          ...cleanTemplates.map((template) => `- ${template}`),
        ].join('\n')
      : "This pool currently has no templates — you're establishing its shape and voice from scratch.";

  const rules = [
    RULE.PLAIN_LINES,
    'Give me 8-12 new templates.',
    'Write TEMPLATES, not finished titles — use placeholders for anything cover-specific ({artist}, {song}, {originalGenre}, {year}, {years}, {decade}). A template with a hard-coded band or song name is wrong.',
    'Do NOT use {transformation} in any new template. The existing templates already lean on it and it keeps producing near-duplicate "{song} + connector + {transformation}" phrasings — I want genuinely different title structures.',
    'When a template needs a word for the rework itself, use a typed category placeholder ({tags.genre}, {tags.energy}, {tags.tempo}, {tags.mood}, {tags.production}, {tags.era}), or {originalGenre}, or a concrete literal word — and vary the sentence shape (a question, "from X to Y", "the {tags.genre} rebuild", a flat statement, ...). Not every template needs a rework word at all.',
    'Introduce structures this pool does not already have — treat the existing templates as tone reference, not a pattern to copy.',
    'Do not put the signal number, channel name, or hashtags in a template — the prefix/suffix system adds those automatically.',
    'Keep them tight — a title, not a sentence, and no clickbait padding ("You won\'t believe...").',
    'Do not end a template with a period unless it is genuinely part of the phrasing.',
  ];

  return [
    TITLE_POOL_INTRO,
    ['CONTEXT', ...context].join('\n'),
    existingSection,
    placeholderNote(buildHookPlaceholders(projectConfig)),
    TITLE_PLACEHOLDER_TYPES,
    ['TASK', ...rules.map((rule) => `- ${rule}`)].join('\n'),
  ];
}

export function buildTitlePoolPrompt(projectConfig, opts) {
  return buildAuthorPrompt(titlePoolContext(projectConfig, opts));
}

// ─── Hook Blocks (description templates) ────────────────────────────────────
// One Hook Block (Project Settings → Blocks → Hook Blocks — Intro · Hook,
// Story Block, Broadcast · Header, Log · Format, ...). Unlike Short Hooks or
// Title pools, these are NOT hooks or titles — they're the phrase pools that
// make up a video's Long/Shorts description, and their subject matter varies
// wildly per block (a broadcast-log opener, a story paragraph, a closing
// signal, a lore line). A block's own name is often opaque ("Log · Format"),
// which is exactly what the optional AI Context / Purpose field exists to
// fix — it is the primary signal here, not a supporting one.
//
// Deliberately does NOT reuse the Short Hook / Title rule set: those ban
// {transformation} and channel metadata ({num}, signal numbers) because that
// makes sense for hooks/titles — Hook Blocks legitimately use both (an Intro
// or Broadcast block routinely reads "[SIGNAL {num}]" or resolves
// {transformation}), so banning them here would be wrong, not just unrelated.
// This is why Hook Blocks get their own adapter rather than being forced into
// an existing one (see CLAUDE.md's Copy AI Prompt section).

const HOOK_BLOCK_INTRO =
  "I need more templates for ONE reusable phrase pool used to build video descriptions in my YouTube cover-song tool. This is a Hook Block: a list of interchangeable lines, and the app picks ONE at random each time a description is generated. These are NOT hooks or titles — they're description copy, and what kind depends entirely on this specific block (it could be an opening line, a log entry, a closing note, anything).";

const SCOPE_LABELS = Object.fromEntries(SCOPE_OPTIONS.map((o) => [o.value, o.label]));
const TARGET_LABELS = Object.fromEntries(TARGET_OPTIONS.map((o) => [o.value, o.label]));

export function hookBlockContext(projectConfig = {}, opts = {}) {
  const { label = '', aiContext = '', scope = 'project', target = 'long', templates = [] } = opts;

  const cleanLabel = String(label || '').trim();
  const cleanAiContext = String(aiContext || '').trim();
  const cleanTemplates = (templates || []).filter((t) => typeof t === 'string' && t.trim());

  const context = [
    projectConfig?.promptContext ? `Channel: ${projectConfig.promptContext}` : '',
    cleanLabel ? `Block name: ${cleanLabel}` : '',
    cleanAiContext
      ? `Purpose (authoritative — what this block is for): ${cleanAiContext}`
      : '',
    `Scope: ${SCOPE_LABELS[scope] || scope}${
      scope === 'song' ? ' (can be overridden per song in the generator, in addition to this pool)' : ''
    }`,
    `Used in: ${TARGET_LABELS[target] || target} description`,
  ].filter(Boolean);

  const existingSection =
    cleanTemplates.length > 0
      ? [
          cleanAiContext
            ? 'CURRENT TEMPLATES in this block (examples/context only — infer the pattern, do not reword these):'
            : 'CURRENT TEMPLATES in this block (this is your main signal for what this block is for, since no Purpose is set — infer its function from these and match it):',
          ...cleanTemplates.map((template) => `- ${template}`),
        ].join('\n')
      : cleanAiContext
        ? "This block has no templates yet — establish its voice from the Purpose above."
        : "This block has no templates yet and no Purpose is set — infer its likely function from the block name above as best you can.";

  const rules = [
    RULE.PLAIN_LINES,
    'No bullets, explanations, headings, or markdown formatting either — just the lines, so I can paste this straight into a bulk-add box.',
    'Give me 8-12 new templates.',
    `Every line must fit specifically what THIS block is for${
      cleanLabel ? ` ("${cleanLabel}")` : ''
    } — not generic description copy that could belong to any block.`,
    cleanAiContext
      ? 'Stay within the Purpose above — that is the authoritative definition of this block\'s role. Do not drift into a different kind of line just because it sounds plausible.'
      : 'Infer this block\'s role from its name and current templates, and stay consistent with that role.',
    RULE.AVOID_DUPLICATES,
    'Keep each template reusable across different songs/covers where this block\'s content allows it — avoid baking in one specific song, artist, or fact unless the block is clearly meant to hold something specific (in which case a placeholder should stand in for it instead).',
    RULE.NO_INVENTED_FACTS,
    'Use only the placeholders listed above, written exactly as shown (e.g. {song}). Do not invent a placeholder name that is not in that list.',
  ];

  return [
    HOOK_BLOCK_INTRO,
    ['CONTEXT', ...context].join('\n'),
    existingSection,
    placeholderNote(buildHookPlaceholders(projectConfig)),
    ['TASK', ...rules.map((rule) => `- ${rule}`)].join('\n'),
  ];
}

export function buildHookBlockPrompt(projectConfig, opts) {
  return buildAuthorPrompt(hookBlockContext(projectConfig, opts));
}
