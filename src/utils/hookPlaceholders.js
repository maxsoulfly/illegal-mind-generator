// Matches the {tags.<category>} substitution resolveTagCategoryPlaceholders
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

// Matches the placeholders generateShortHooks.js's fillHookTemplate replaces.
// Used by both the project-level hook editor (HookTemplateEditor) and the
// per-tag hook editor (TagShortHooksTab) so they stay in sync.
export const HOOK_PLACEHOLDERS = [
  '{artist}',
  '{song}',
  '{signalNumber}',
  '{num}',
  '{decade}',
  '{year}',
  '{years}',
  '{currentYear}',
  '{primaryTag}',
  '{originalGenre}',
  '{transformation}',
  ...TAG_CATEGORY_PLACEHOLDERS,
];

// Matches the {tag} substitution generateThumbnails.js's buildGenericTagThumbnailPhrases
// applies. Thumbnail words/fallbacks support no placeholders at all (literal text only).
export const THUMBNAIL_TAG_PLACEHOLDER = ['{tag}'];
