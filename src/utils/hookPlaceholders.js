import { REGISTRY_TOKENS } from '../engine/placeholders';

// Matches the {tags.<category>} substitution resolveTagCategoryValue
// (descriptionTagHelpers.js) applies — shared by hooks, titles, and text
// blocks, so keep this list in sync with TAG_CATEGORY_ALIASES there.
export const TAG_CATEGORY_PLACEHOLDERS = [
  '{tags.era}',
  '{tags.genre}',
  '{tags.intent}',
  '{tags.mood}',
  '{tags.lang}',
  '{tags.energy}',
  '{tags.production}',
  '{tags.tempo}',
];

// {num} and {transformation} aren't in the shared REGISTRY (src/engine/placeholders.js)
// by design — {num}'s fallback text differs per caller (hooks/titles use 'XX',
// descriptions use '00'), and {transformation} fills its own nested template
// rather than being a single-value resolver. Still real, working placeholders,
// so listed here explicitly alongside the auto-synced REGISTRY_TOKENS.
const SPECIAL_TOKENS = ['num', 'transformation'];

// The placeholders every hook/text-block template can use. Everything except
// TAG_CATEGORY_PLACEHOLDERS and SPECIAL_TOKENS is derived from
// src/engine/placeholders.js's REGISTRY — add a resolver there and it shows up
// here (and in every editor that imports HOOK_PLACEHOLDERS) automatically.
export const HOOK_PLACEHOLDERS = [
  ...REGISTRY_TOKENS.map((token) => `{${token}}`),
  ...SPECIAL_TOKENS.map((token) => `{${token}}`),
  ...TAG_CATEGORY_PLACEHOLDERS,
];

// Matches the {tag} substitution generateThumbnails.js's buildGenericTagThumbnailPhrases
// applies. Thumbnail words/fallbacks support no placeholders at all (literal text only).
export const THUMBNAIL_TAG_PLACEHOLDER = ['{tag}'];
