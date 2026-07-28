import { REGISTRY_TOKENS } from '../engine/placeholders';
import { TAG_CATEGORY_PLACEHOLDERS } from './hookPlaceholders';
import { TAG_CATEGORY_ALIASES } from '../engine/descriptions/descriptionTagHelpers';

// One-way "copy for AI" builder — no parse-back counterpart, unlike
// tagPrompt.js/searchQuery.js's round-trip prompts. This app is
// local-first/no-backend by design, so it never calls an AI itself; this
// just formats the project's full placeholder set as clipboard text.

// Short human-readable description per built-in token. Keys must match
// REGISTRY_TOKENS (src/engine/placeholders.js) plus the two SPECIAL_TOKENS
// (hookPlaceholders.js) that live outside the registry by design. A token
// added to REGISTRY without a matching entry here just shows "" — fill it in.
const PLACEHOLDER_DESCRIPTIONS = {
  artist: 'Artist name from the form',
  song: 'Song title from the form',
  year: 'Original release year',
  years: '"X years" phrasing (years since original release)',
  decade: 'Decade label from the selected era tag (e.g. "90s")',
  signalNumber: 'The Signal number field',
  currentYear: "Today's real calendar year",
  primaryTag: 'Selected transformation tag(s), formatted per title config',
  originalGenre: 'One randomly picked genre from the Original Genre field',
  tagLine: 'Precomputed tag-line summary of selected tags',
  logNote: 'Song-specific log note override, or a random log line if none set',
  fileId: 'Deterministic ID from song title initials + signal number',
  operatorStatus: 'Random operator/status phrase',
  num: 'Sequential number used in title/hook prefix-suffix wrapping',
  transformation: 'Fills the transformation block template for the selected tag(s)',
};

const SPECIAL_TOKENS = ['num', 'transformation'];

const BUILT_IN_TOKENS = [...REGISTRY_TOKENS, ...SPECIAL_TOKENS];

function tagCategoryDescription(token) {
  // token is e.g. '{tags.lang}' — resolve through TAG_CATEGORY_ALIASES since
  // the placeholder key and the real tag category name can differ (lang -> language).
  const key = token.slice('{tags.'.length, -1);
  const category = TAG_CATEGORY_ALIASES[key] || key;
  return `Random selected tag's label in the "${category}" category (empty if none selected)`;
}

// Structured, per-project reference of every placeholder token usable in
// templates right now: built-in engine tokens, {tags.*} category tokens,
// this project's {links.*} tokens, and this project's {custom.*} tokens
// (description.placeholders — see ProjectSettingsPlaceholders.jsx).
export function buildPlaceholderReference(projectConfig) {
  const builtIn = BUILT_IN_TOKENS.map((token) => ({
    token: `{${token}}`,
    description: PLACEHOLDER_DESCRIPTIONS[token] || '',
  }));

  const tagCategories = TAG_CATEGORY_PLACEHOLDERS.map((token) => ({
    token,
    description: tagCategoryDescription(token),
  }));

  const links = Object.keys(projectConfig?.description?.links || {}).map((key) => ({
    token: `{links.${key}}`,
    description: `Project link value for "${key}"`,
  }));

  const custom = (projectConfig?.description?.placeholders || []).map((p) => ({
    token: `{custom.${p.key}}`,
    description: p.label || p.key,
  }));

  return { builtIn, tagCategories, links, custom };
}

function formatSection(title, entries) {
  if (entries.length === 0) return [];
  return [`${title}:`, ...entries.map((e) => `${e.token} — ${e.description}`), ''];
}

// Plain-text version of the BUILT-IN + TAG CATEGORIES groups only, for
// pasting into an AI chat as context — deliberately excludes PROJECT LINKS
// and CUSTOM (project-specific plumbing an AI writing phrases doesn't need).
// Neither group depends on projectConfig, so this takes no arguments.
export function buildPlaceholderPrompt() {
  const { builtIn, tagCategories } = buildPlaceholderReference();

  const lines = [
    "Here's a list of all placeholders I have available. Each can be used inside templates as shown.",
    '',
    ...formatSection('BUILT-IN', builtIn),
    ...formatSection('TAG CATEGORIES', tagCategories),
  ];

  return lines.join('\n').trimEnd();
}
