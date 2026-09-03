// Smoke test for tagContentSections.js -- the pure model behind the Tag
// Library card's drill-down navigation (Stage 0 of the IA rework). Guards
// the count selectors, the sourceTarget -> initial view mapping, the
// back-navigation map, config-driven Short Hook categories (incl. contrast),
// and the leaf-editor prop resolver.
//
// Run: npx rolldown src/utils/tagContentSections.test.js -f esm -p node \
//        -o /tmp/tcs.test.mjs && node /tmp/tcs.test.mjs

import {
  TAG_CONTENT_SECTIONS,
  DESCRIPTION_GROUPS,
  sectionCount,
  descriptionGroupCount,
  shortHookCategoryCount,
  getShortHookCategories,
  getInitialView,
  isSourceMatch,
  parentOf,
  resolvePoolEditorProps,
  pickTagPhrasePlaceholders,
} from './tagContentSections';
import { LIVE_PLACEHOLDERS } from './hookPlaceholders';

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!cond) failures++;
};
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}\n    got ${JSON.stringify(a)}`);

// --- fixtures --------------------------------------------------------------

const tag = {
  name: 'faithful',
  maps: {
    title: ['Authentic Cover', 'Full Band Cover', 'Original Energy'],
    thumbnail: ['FAITHFUL', 'AS RECORDED'],
    hashtags: ['faithfulcover'],
    description: {
      technical: ['Arrangement: unchanged.', 'Key: original.'],
      log: ['Played it straight.'],
      status: [],
    },
    shortHooks: {
      nostalgia: ['{song} the way you remember it'],
      discussion: ['How close should a cover stay to {song}?', 'Would you change anything?'],
      contrast: ['A {originalGenre} classic, kept intact'],
    },
  },
};

const emptyDescTag = { name: 'x', maps: { title: [], thumbnail: [], hashtags: [], description: null, shortHooks: {} } };

const projectConfig = {
  shortHookTypes: {
    nostalgia: { label: 'Nostalgia' },
    emotion: { label: 'Emotion' },
    transformation: { label: 'Transformation' },
    discussion: { label: 'Discussion' },
    musician: { label: 'Musician' },
    progress: { label: 'Progress' },
    contrast: { label: 'Contrast' },
  },
};

// --- section list -------------------------------------------------------------

eq(
  TAG_CONTENT_SECTIONS.map((s) => s.id),
  ['titles', 'thumbnails', 'descriptions', 'shortHooks', 'hashtags'],
  'sections: 5 rows in the mocked order',
);
eq(
  TAG_CONTENT_SECTIONS.map((s) => s.kind),
  ['pool', 'pool', 'groups', 'categories', 'pool'],
  'sections: descriptions=groups, shortHooks=categories, rest=pool',
);
eq(DESCRIPTION_GROUPS.map((g) => g.id), ['technical', 'log', 'status'], 'description groups: technical/log/status');

// --- sectionCount ----------------------------------------------------------

ok(sectionCount(tag, 'titles') === 3, 'count: titles reads tag.maps.title.length');
ok(sectionCount(tag, 'thumbnails') === 2, 'count: thumbnails reads tag.maps.thumbnail.length');
ok(sectionCount(tag, 'hashtags') === 1, 'count: hashtags');
ok(sectionCount(tag, 'descriptions') === 3, 'count: descriptions sums technical+log+status (2+1+0)');
ok(sectionCount(tag, 'shortHooks') === 4, 'count: shortHooks sums every category (1+2+1)');
ok(sectionCount(emptyDescTag, 'descriptions') === 0, 'count: descriptions is 0 when tag.maps.description is null');
ok(sectionCount(emptyDescTag, 'shortHooks') === 0, 'count: shortHooks is 0 for an empty map');
ok(sectionCount({}, 'titles') === 0, 'count: tolerates a tag with no maps');

// --- descriptionGroupCount / shortHookCategoryCount ----------------------

ok(descriptionGroupCount(tag, 'technical') === 2, 'group count: technical');
ok(descriptionGroupCount(tag, 'status') === 0, 'group count: status (present but empty)');
ok(descriptionGroupCount(emptyDescTag, 'log') === 0, 'group count: 0 when description is null');
ok(shortHookCategoryCount(tag, 'discussion') === 2, 'category count: discussion');
ok(shortHookCategoryCount(tag, 'contrast') === 1, 'category count: contrast is real, not hidden');
ok(shortHookCategoryCount(tag, 'emotion') === 0, 'category count: absent category -> 0');

// --- getShortHookCategories (config-driven, incl. contrast) --------------

const cats = getShortHookCategories(projectConfig);
eq(
  cats.map((c) => c.id),
  ['nostalgia', 'emotion', 'transformation', 'discussion', 'musician', 'progress', 'contrast'],
  'categories: all 7 from config, in key order, contrast included',
);
ok(cats.find((c) => c.id === 'contrast').label === 'Contrast', 'categories: label comes from config');
eq(getShortHookCategories({}), [], 'categories: [] when no shortHookTypes');
eq(
  getShortHookCategories({ shortHookTypes: { weird: {} } }),
  [{ id: 'weird', label: 'weird' }],
  'categories: label falls back to the key',
);

// --- getInitialView ------------------------------------------------------

eq(getInitialView(tag, null), { level: 'overview' }, 'initial view: no target -> overview');
eq(
  getInitialView(tag, { tagName: 'other', field: 'title' }),
  { level: 'overview' },
  'initial view: target for a different tag -> overview',
);
eq(
  getInitialView(tag, { tagName: 'faithful', field: 'title' }),
  { level: 'pool', field: 'titles' },
  'initial view: field:title -> pool/titles',
);
eq(
  getInitialView(tag, { tagName: 'faithful', field: 'thumbnail' }),
  { level: 'pool', field: 'thumbnails' },
  'initial view: field:thumbnail -> pool/thumbnails',
);
eq(
  getInitialView(tag, { tagName: 'faithful', field: 'hashtags' }),
  { level: 'pool', field: 'hashtags' },
  'initial view: field:hashtags -> pool/hashtags',
);
eq(
  getInitialView(tag, { tagName: 'faithful', hookType: 'contrast', hookText: 'x' }),
  { level: 'shortHookPool', category: 'contrast' },
  'initial view: hookType -> shortHookPool/<category>',
);
eq(
  getInitialView(tag, { tagName: 'faithful', hookText: 'some hook' }),
  { level: 'shortHookCategories' },
  'initial view: hookText only (no hookType) -> shortHookCategories',
);
eq(
  getInitialView(tag, { tagName: 'faithful', field: 'unmapped' }),
  { level: 'overview' },
  'initial view: same tag, unrecognised field -> overview',
);
// hook match must win over a field on the same target
eq(
  getInitialView(tag, { tagName: 'faithful', field: 'title', hookType: 'emotion' }),
  { level: 'shortHookPool', category: 'emotion' },
  'initial view: hook match takes precedence over field',
);

// --- parentOf ----------------------------------------------------------------

eq(parentOf({ level: 'basics' }), { level: 'overview' }, 'parent: basics -> overview');
eq(parentOf({ level: 'pool', field: 'titles' }), { level: 'overview' }, 'parent: pool -> overview');
eq(parentOf({ level: 'shortHookCategories' }), { level: 'overview' }, 'parent: shortHookCategories -> overview');
eq(
  parentOf({ level: 'shortHookPool', category: 'emotion' }),
  { level: 'shortHookCategories' },
  'parent: shortHookPool -> shortHookCategories',
);
eq(parentOf({ level: 'descriptionGroups' }), { level: 'overview' }, 'parent: descriptionGroups -> overview');
eq(
  parentOf({ level: 'descriptionPool', group: 'log' }),
  { level: 'descriptionGroups' },
  'parent: descriptionPool -> descriptionGroups',
);
ok(parentOf({ level: 'overview' }) === null, 'parent: overview is the root -> null');

// --- resolvePoolEditorProps -------------------------------------------------

eq(
  resolvePoolEditorProps(tag, { level: 'pool', field: 'titles' }),
  { heading: 'Long title phrases', field: 'title', parentField: undefined, parentValue: undefined, phrases: tag.maps.title },
  'leaf props: flat pool resolves field/heading/phrases, no parent',
);
{
  const props = resolvePoolEditorProps(tag, { level: 'descriptionPool', group: 'technical' });
  ok(props.field === 'technical' && props.parentField === 'description', 'leaf props: descriptionPool field + parentField');
  ok(props.parentValue === tag.maps.description, 'leaf props: descriptionPool parentValue is the live description map');
  eq(props.phrases, tag.maps.description.technical, 'leaf props: descriptionPool phrases');
  ok(props.heading === 'Technical phrases', 'leaf props: descriptionPool heading');
}
{
  const props = resolvePoolEditorProps(tag, { level: 'shortHookPool', category: 'contrast' });
  ok(props.field === 'contrast' && props.parentField === 'shortHooks', 'leaf props: shortHookPool field + parentField');
  ok(props.parentValue === tag.maps.shortHooks, 'leaf props: shortHookPool parentValue is the live shortHooks map');
  eq(props.phrases, tag.maps.shortHooks.contrast, 'leaf props: shortHookPool phrases');
  ok(props.heading === null, 'leaf props: shortHookPool heading is null (caller supplies the label)');
}
eq(
  resolvePoolEditorProps(emptyDescTag, { level: 'shortHookPool', category: 'emotion' }).phrases,
  [],
  'leaf props: absent short-hook category -> empty phrase list',
);
eq(
  resolvePoolEditorProps(emptyDescTag, { level: 'descriptionPool', group: 'log' }).phrases,
  [],
  'leaf props: descriptionPool phrases -> [] when description is null',
);
ok(resolvePoolEditorProps(tag, { level: 'overview' }) === null, 'leaf props: non-leaf view -> null');

// --- isSourceMatch (moved here from the deleted tagFieldTabs.js) --------

ok(isSourceMatch({ field: 'title' }, { field: 'title' }), 'isSourceMatch: field == entry.field');
ok(isSourceMatch({ hookType: 'contrast' }, { field: 'contrast' }), 'isSourceMatch: hookType == entry.field');
ok(!isSourceMatch({ field: 'title' }, { field: 'thumbnail' }), 'isSourceMatch: non-matching field');
ok(!isSourceMatch(null, { field: 'title' }), 'isSourceMatch: tolerates a null target');
ok(!isSourceMatch({ hookType: 'emotion' }, { field: 'nostalgia' }), 'isSourceMatch: non-matching hookType');

// --- pickTagPhrasePlaceholders -------------------------------------------

ok(pickTagPhrasePlaceholders('titles', projectConfig) === LIVE_PLACEHOLDERS, 'placeholders: titles -> LIVE_PLACEHOLDERS');
{
  const thumb = pickTagPhrasePlaceholders('thumbnails', projectConfig);
  const hooks = pickTagPhrasePlaceholders('shortHooks', projectConfig);
  ok(Array.isArray(thumb) && thumb.includes('{artist}'), 'placeholders: thumbnails -> full hook set');
  ok(Array.isArray(hooks) && hooks.includes('{artist}'), 'placeholders: shortHooks -> full hook set');
  ok(thumb.length > LIVE_PLACEHOLDERS.length, 'placeholders: full set is wider than the live subset');
}
ok(pickTagPhrasePlaceholders('descriptions', projectConfig) === undefined, 'placeholders: descriptions -> none');
ok(pickTagPhrasePlaceholders('hashtags', projectConfig) === undefined, 'placeholders: hashtags -> none');

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
