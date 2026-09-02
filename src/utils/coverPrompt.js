// Builds a paste-into-an-AI-chat prompt for generating cover-specific Short
// Hooks (formData.coverShortHooks — a flat, uncategorized per-cover list).
// One-way, like tagPrompt.js / calendarImportPrompt.js / buildPlaceholderPrompt:
// this app is local-first and never calls an AI itself. There is no
// parse-back — the AI's flat list pastes straight into the editor's Bulk box.
//
// The point of this pool is hooks grounded in facts unique to ONE cover
// (a personal reason for covering it, a recording/arrangement detail, an
// anecdote, an in-joke) — NOT generic transformation lines, which the
// tag/global hook system + placeholders already generate.

import { buildTagPhrase } from '../engine/descriptions/descriptionTagHelpers';
import { buildHookPlaceholders } from './hookPlaceholders';

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

export function buildCoverHookPrompt(formData = {}, projectConfig = {}) {
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
