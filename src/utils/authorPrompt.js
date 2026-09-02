// Shared skeleton for the "Copy AI Prompt" authoring helpers — the paste-
// into-an-AI-chat prompts that ask an external AI for fresh candidate lines
// for ONE phrase pool (cover-specific Short Hooks, a tag's Short Hooks
// category, a global Short Hook type, a Title template group). One-way by
// design, exactly like coverPrompt.js / tagPrompt.js / calendarImportPrompt.js:
// this app is local-first and never calls an AI itself, so there is no
// parse-back counterpart — the editor's existing Bulk Add box is the return
// path.
//
// buildAuthorPrompt is deliberately dumb: it takes an ordered list of
// already-formatted section strings, drops the empty ones, and joins the rest
// with a single blank line. Each per-editor adapter (authorPromptContexts.js)
// owns the wording of its own sections; this file owns only the assembly, a
// few formatting helpers, and the rule fragments shared across adapters.

// Join an ordered list of section strings into one prompt. Falsy or
// whitespace-only sections are dropped, so an adapter can pass
// `placeholders.length ? placeholderNote(...) : null` inline without
// branching the section array.
export function buildAuthorPrompt(sections = []) {
  return sections
    .filter((section) => typeof section === 'string' && section.trim())
    .join('\n\n')
    .trimEnd();
}

// "HEADING" on its own line, then one clean item per line. Returns '' when
// there are no items and keepHeading is false — so an omitted section drops
// out of buildAuthorPrompt entirely rather than leaving a bare header.
export function headedList(heading, items = [], { keepHeading = false } = {}) {
  const clean = items.filter((item) => typeof item === 'string' && item.trim());
  if (clean.length === 0 && !keepHeading) return '';
  return [heading, ...clean].join('\n');
}

// Same as headedList, but each item is rendered as a "- " bullet (TASK
// bullets, example lines).
export function headedBullets(heading, items = [], opts) {
  const bulleted = items
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => `- ${item}`);
  return headedList(heading, bulleted, opts);
}

// "Label: value" lines from an object, in insertion order, skipping empty
// values. Adapters that need conditional ordering or repeated labels build
// the array by hand instead.
export function contextLines(pairs = {}) {
  return Object.entries(pairs)
    .filter(([, value]) => String(value ?? '').trim())
    .map(([label, value]) => `${label}: ${String(value).trim()}`);
}

// The standard framing line for the optional placeholder section. `tokens`
// is the raw token list (e.g. buildHookPlaceholders(projectConfig)). Returns
// '' for an empty list so the section drops out. NOTE: the cover adapter
// keeps its own verbatim placeholder wording (frozen by an A/B snapshot
// test) and does not call this — it exists for the tag / global-short-hook /
// title adapters.
export function placeholderNote(tokens = []) {
  const clean = tokens.filter((token) => typeof token === 'string' && token.trim());
  if (clean.length === 0) return '';
  return `PLACEHOLDERS (optional): you can drop any of these tokens into a line and the app fills them in — ${clean.join(
    ', ',
  )}. Don't force them; only use one where it reads naturally.`;
}

// Rule fragments shared across adapters. The cover adapter keeps its own
// verbatim bullet wording (byte-frozen by authorPromptContexts.js's A/B
// snapshot test), so these are consumed by the tag / global-short-hook /
// title adapters. Add a fragment here only when more than one adapter needs
// the exact same string; adapter-specific wording stays in the adapter.
export const RULE = {
  PLAIN_LINES:
    'Reply with a flat list, one candidate per line. No numbering, no headers, no category labels — I paste this straight into a bulk-add box.',
  NO_INVENTED_FACTS:
    'Do not invent facts. Only state something specific if the CONTEXT above supports it.',
  NO_GENERIC_FILLER:
    'No filler. Cut any line vague enough that it would fit a different song, tag, or genre unchanged.',
  NO_CHANNEL_METADATA:
    'Never put signal numbers, hashtags, or other channel/admin metadata in a line — that is context for you, not material for the output.',
  AVOID_DUPLICATES:
    'Do not repeat or lightly reword anything already in the list above.',
  SHORT_HOOK_LENGTH:
    'Keep each line short — usually 5-12 words. One punchy thought reads better than a full explanatory sentence.',
  SHORT_HOOK_NO_PERIOD:
    'Do not end a line with a period. Internal punctuation is fine — a line like "One take. No edits" is good, just no final ".".',
  SHORT_HOOK_NATURAL:
    'Keep them natural and clickable — the kind of thing a person actually says on camera, not marketing copy.',
};
