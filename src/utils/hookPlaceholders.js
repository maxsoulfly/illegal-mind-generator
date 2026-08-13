import { REGISTRY_TOKENS, ALWAYS_LIVE_TOKENS } from '../engine/placeholders';

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
// applies at pick time -- a separate, literal token unrelated to the REGISTRY
// placeholder system. Combine with LIVE_PLACEHOLDERS for Generic Tag
// Templates, which supports both.
export const THUMBNAIL_TAG_PLACEHOLDER = ['{tag}'];

// Placeholders safe to resolve at plain render time with zero pick/render
// freeze risk -- every token here is a pure function of live formData (no
// pooled/random resolution, see placeholders.js's ALWAYS_LIVE_TOKENS), so
// filling it fresh on every keystroke can never re-roll a different value
// the way {originalGenre}/{tags.*} would. Used for per-tag Title/Thumbnail
// phrases (TagFieldTab.jsx) and the project-level thumbnail Words/Fallbacks/
// Generic Tag Templates pools (ProjectSettingsThumbnails.jsx), none of which
// have pick-phase freezing of their own (see resolveTitleRecord.js/
// generateThumbnails.js) -- a broader set would need that freezing added
// first to avoid re-rolling on every render.
export const LIVE_PLACEHOLDERS = REGISTRY_TOKENS
  .filter((token) => ALWAYS_LIVE_TOKENS.has(token))
  .map((token) => `{${token}}`);

// HOOK_PLACEHOLDERS plus any project-defined Custom Placeholders
// (description.placeholders — see ProjectSettingsPlaceholders.jsx /
// placeholders.js's resolveCustomPlaceholder), so their {custom.<key>}
// tokens show up in the same autocomplete. Call sites that don't have a
// projectConfig handy (or don't need per-project awareness) can keep using
// the static HOOK_PLACEHOLDERS unchanged.
export function buildHookPlaceholders(projectConfig) {
  const customTokens = (projectConfig?.description?.placeholders || []).map((p) => `{custom.${p.key}}`);
  return [...HOOK_PLACEHOLDERS, ...customTokens];
}
