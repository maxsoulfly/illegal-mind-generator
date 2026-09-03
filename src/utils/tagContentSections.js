// Pure model + selectors for the Tag Library card's drill-down navigation
// (Tag -> Content overview -> Content type -> Pool editor). No React, no
// state -- every count is read live off the `tag` object built by
// buildTagExplorerData.js (`tag.maps` / `tag.usageCount`), so the overview
// never holds a duplicate copy of a phrase count.
//
// Stage 0 of the Tag card IA rework: this module is added but not yet wired
// into any component -- TagEditor still uses its own `activeTab` string.
// Stage 1+ replaces that with the `view` descriptors described here.
//
//   view descriptors (a tiny state machine, one useState in TagEditor):
//     { level: 'overview' }
//     { level: 'basics' }
//     { level: 'pool', field: 'titles' | 'thumbnails' | 'hashtags' }
//     { level: 'shortHookCategories' }
//     { level: 'shortHookPool', category: <shortHookTypes key> }
//     { level: 'descriptionGroups' }
//     { level: 'descriptionPool', group: 'technical' | 'log' | 'status' }

import { buildHookPlaceholders, LIVE_PLACEHOLDERS } from './hookPlaceholders';

// The 5 rows on the Level 1 overview. `kind` decides what a click drills to:
//   'pool'       -> straight to the phrase editor (one flat pool)
//   'groups'     -> Level 2 list of description sub-pools
//   'categories' -> Level 2 list of Short Hook categories
export const TAG_CONTENT_SECTIONS = [
  { id: 'titles', label: 'Titles', kind: 'pool' },
  { id: 'thumbnails', label: 'Thumbnails', kind: 'pool' },
  { id: 'descriptions', label: 'Descriptions', kind: 'groups' },
  { id: 'shortHooks', label: 'Short Hooks', kind: 'categories' },
  { id: 'hashtags', label: 'Hashtags', kind: 'pool' },
];

// Description is the one built-in multi-pool section (never flattened).
export const DESCRIPTION_GROUPS = [
  { id: 'technical', label: 'Technical' },
  { id: 'log', label: 'Log' },
  { id: 'status', label: 'Status' },
];

// Section id -> the key it uses inside `tag.maps` (they differ for the flat
// pools: the section is plural, the map key is singular).
const SECTION_MAP_KEY = {
  titles: 'title',
  thumbnails: 'thumbnail',
  hashtags: 'hashtags',
};

// Heading shown above a flat-pool editor (matches the old TAG_FIELD_TABS
// `title` strings so nothing reads differently).
export const POOL_TITLES = {
  titles: 'Long title phrases',
  thumbnails: 'Thumbnail phrases',
  hashtags: 'Hashtags',
};

const DESCRIPTION_GROUP_TITLES = {
  technical: 'Technical phrases',
  log: 'Log phrases',
  status: 'Status phrases',
};

// ---------------------------------------------------------------------------
// Counts -- all derived from `tag.maps`, which resolveTagOverride always
// fills (arrays default to [], description may be null).
// ---------------------------------------------------------------------------

const len = (value) => (Array.isArray(value) ? value.length : 0);

const sumValues = (obj) =>
  obj && typeof obj === 'object'
    ? Object.values(obj).reduce((total, arr) => total + len(arr), 0)
    : 0;

export function sectionCount(tag, sectionId) {
  const maps = tag?.maps || {};

  if (sectionId === 'descriptions') return sumValues(maps.description);
  if (sectionId === 'shortHooks') return sumValues(maps.shortHooks);

  const mapKey = SECTION_MAP_KEY[sectionId];
  return mapKey ? len(maps[mapKey]) : 0;
}

export function descriptionGroupCount(tag, groupId) {
  return len(tag?.maps?.description?.[groupId]);
}

export function shortHookCategoryCount(tag, categoryId) {
  return len(tag?.maps?.shortHooks?.[categoryId]);
}

// ---------------------------------------------------------------------------
// Short Hook categories -- config-driven off projectConfig.shortHookTypes
// (7 in both projects today, incl. `contrast`), replacing the hardcoded 6
// in tagFieldTabs.js. Order follows the config's key order; label falls
// back to the key.
// ---------------------------------------------------------------------------

export function getShortHookCategories(projectConfig) {
  return Object.entries(projectConfig?.shortHookTypes || {}).map(([id, cfg]) => ({
    id,
    label: cfg?.label || id,
  }));
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

// Where a card should open when it's the target of a click-to-navigate from
// generated output. Mirrors TagEditor.getInitialTab's precedence (hook match
// before field match); the two new shapes are the Short Hook views. Any
// same-tag target with no recognised field lands on the overview (the old
// code fell back to the Basics tab -- overview is the better equivalent now,
// the tag's content map is right there).
export function getInitialView(tag, sourceTarget) {
  if (!sourceTarget || sourceTarget.tagName !== tag?.name) {
    return { level: 'overview' };
  }

  if (sourceTarget.hookText || sourceTarget.hookType) {
    return sourceTarget.hookType
      ? { level: 'shortHookPool', category: sourceTarget.hookType }
      : { level: 'shortHookCategories' };
  }

  if (sourceTarget.field === 'title') return { level: 'pool', field: 'titles' };
  if (sourceTarget.field === 'thumbnail') return { level: 'pool', field: 'thumbnails' };
  if (sourceTarget.field === 'hashtags') return { level: 'pool', field: 'hashtags' };

  return { level: 'overview' };
}

// One step back up the hierarchy. `overview` is the root -> null.
export function parentOf(view) {
  switch (view?.level) {
    case 'basics':
    case 'pool':
    case 'shortHookCategories':
    case 'descriptionGroups':
      return { level: 'overview' };
    case 'shortHookPool':
      return { level: 'shortHookCategories' };
    case 'descriptionPool':
      return { level: 'descriptionGroups' };
    case 'overview':
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Leaf editor props -- everything a <TagPhraseEditor> needs for a given leaf
// view, resolved from `tag` alone. `parentValue` mirrors TagFieldTab's
// `tag.maps[parentField] || {}` so buildUpdate's nested spread stays correct.
// The caller supplies the human `title` (it has it from the section /
// category list); only `heading` for the static pools is filled here.
// ---------------------------------------------------------------------------

export function resolvePoolEditorProps(tag, view) {
  const maps = tag?.maps || {};

  if (view?.level === 'pool') {
    const mapKey = SECTION_MAP_KEY[view.field];
    return {
      heading: POOL_TITLES[view.field],
      field: mapKey,
      parentField: undefined,
      parentValue: undefined,
      phrases: Array.isArray(maps[mapKey]) ? maps[mapKey] : [],
    };
  }

  if (view?.level === 'descriptionPool') {
    return {
      heading: DESCRIPTION_GROUP_TITLES[view.group],
      field: view.group,
      parentField: 'description',
      parentValue: maps.description || {},
      phrases: Array.isArray(maps.description?.[view.group]) ? maps.description[view.group] : [],
    };
  }

  if (view?.level === 'shortHookPool') {
    return {
      heading: null, // caller passes the category label
      field: view.category,
      parentField: 'shortHooks',
      parentValue: maps.shortHooks || {},
      phrases: Array.isArray(maps.shortHooks?.[view.category]) ? maps.shortHooks[view.category] : [],
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Placeholder autocomplete set for a leaf editor -- lifted verbatim from
// TagFieldTab's ternary. Titles resolve at plain render time with no
// pick-phase freezing (resolveTitleRecord.js), so they only get the
// always-live subset; Thumbnails and Short Hooks have real freeze support
// end-to-end and get the full set. Descriptions / Hashtags: no autocomplete.
// ---------------------------------------------------------------------------

export function pickTagPhrasePlaceholders(sectionId, projectConfig) {
  if (sectionId === 'titles') return LIVE_PLACEHOLDERS;
  if (sectionId === 'thumbnails' || sectionId === 'shortHooks') {
    return buildHookPlaceholders(projectConfig);
  }
  return undefined;
}
