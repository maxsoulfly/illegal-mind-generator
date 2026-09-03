// Smoke test for contentSetupNav.js — the pure navigation model behind the
// Project Settings -> "Content Setup" IA rework (Stage 0). Guards the
// section registry, the legacy-id -> {section, leaf} resolver (incl. the
// 'descriptions' legacy/new-id collision and the blocksTarget.subTab
// handling), and the leaf-list helpers.
//
// Run: npx rolldown src/config/contentSetupNav.test.js -f esm -p node \
//        -o /tmp/csn.test.mjs && node /tmp/csn.test.mjs

import {
  CONTENT_SETUP_SECTIONS,
  resolveContentSetupTarget,
  getSection,
  getSectionLeaves,
  DESCRIPTION_GROUPS,
  groupOfDescriptionLeaf,
} from './contentSetupNav';

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!cond) failures++;
};
const eq = (a, b, msg) =>
  ok(JSON.stringify(a) === JSON.stringify(b), `${msg}\n    got ${JSON.stringify(a)}`);

// ---------------------------------------------------------------------------
// registry
// ---------------------------------------------------------------------------

eq(
  CONTENT_SETUP_SECTIONS.map((s) => s.id),
  ['generation', 'descriptions', 'workflow', 'project'],
  'registry: 4 sections in workflow-first-ish order',
);
eq(
  CONTENT_SETUP_SECTIONS.map((s) => s.kind),
  ['workspace', 'workspace', 'page', 'page'],
  'registry: generation + descriptions = workspace, workflow/project = page',
);
ok(
  CONTENT_SETUP_SECTIONS.every((s) => s.label && Array.isArray(s.leaves) && s.leaves.length > 0),
  'registry: every section has a label and a non-empty leaves array',
);
ok(
  CONTENT_SETUP_SECTIONS.every((s) => s.leaves.every((l) => l.id && l.label)),
  'registry: every leaf has id + label',
);
eq(
  getSectionLeaves('generation').map((l) => l.id),
  ['titles', 'shortHooks', 'thumbnails', 'hashtags'],
  'registry: generation leaves',
);
eq(
  getSectionLeaves('descriptions').map((l) => l.id),
  ['long', 'shorts', 'lists', 'text', 'hooks', 'groups', 'placeholders', 'links'],
  'registry: descriptions leaves (still a flat 8 — DESCRIPTION_GROUPS is display-only)',
);

// ---------------------------------------------------------------------------
// DESCRIPTION_GROUPS — the drill overview's display grouping
// ---------------------------------------------------------------------------

eq(
  DESCRIPTION_GROUPS.map((g) => g.id),
  ['layouts', 'blocks', 'variables'],
  'groups: layouts -> blocks -> variables (Variables feed Blocks feed Layouts)',
);
eq(
  DESCRIPTION_GROUPS.flatMap((g) => g.leafIds),
  ['long', 'shorts', 'lists', 'text', 'hooks', 'groups', 'placeholders', 'links'],
  'groups: every descriptions leaf is covered exactly once, in order',
);
ok(
  DESCRIPTION_GROUPS.every((g) => g.id && g.label && Array.isArray(g.leafIds) && g.leafIds.length),
  'groups: every group has id + label + non-empty leafIds',
);
ok(
  groupOfDescriptionLeaf('long') === 'layouts' &&
    groupOfDescriptionLeaf('hooks') === 'blocks' &&
    groupOfDescriptionLeaf('placeholders') === 'variables' &&
    groupOfDescriptionLeaf('links') === 'variables',
  'groupOfDescriptionLeaf: long->layouts, hooks->blocks, placeholders/links->variables',
);
ok(groupOfDescriptionLeaf('nope') === null, 'groupOfDescriptionLeaf: unknown leaf -> null');
eq(
  getSectionLeaves('workflow').map((l) => l.id),
  ['shortsQueue', 'todo', 'uploadSchedule'],
  'registry: workflow leaves',
);
eq(getSectionLeaves('project').map((l) => l.id), ['projectInfo'], 'registry: project leaves (single page)');
ok(getSection('nope') === null && getSectionLeaves('nope').length === 0, 'registry: unknown section -> null / []');

// ---------------------------------------------------------------------------
// resolveContentSetupTarget — all 11 legacy PROJECT_SETTING_SECTIONS ids
// ---------------------------------------------------------------------------

eq(resolveContentSetupTarget('general'), { section: 'project', leaf: 'projectInfo' }, 'legacy: general -> project/projectInfo');
eq(resolveContentSetupTarget('shortHooks'), { section: 'generation', leaf: 'shortHooks' }, 'legacy: shortHooks -> generation/shortHooks');
eq(resolveContentSetupTarget('titles'), { section: 'generation', leaf: 'titles' }, 'legacy: titles -> generation/titles');
eq(resolveContentSetupTarget('descriptions'), { section: 'descriptions', leaf: 'long' }, 'legacy: bare descriptions -> descriptions/long (default leaf, no overview)');
eq(resolveContentSetupTarget('layout'), { section: 'descriptions', leaf: 'long' }, 'legacy: retired `layout` leaf id -> descriptions/long');
eq(resolveContentSetupTarget('links'), { section: 'descriptions', leaf: 'links' }, 'legacy: links -> descriptions/links');
eq(resolveContentSetupTarget('blocks'), { section: 'descriptions', leaf: 'lists' }, 'legacy: blocks (no subTab) -> descriptions/lists (first block leaf)');
eq(resolveContentSetupTarget('thumbnails'), { section: 'generation', leaf: 'thumbnails' }, 'legacy: thumbnails -> generation/thumbnails');
eq(resolveContentSetupTarget('hashtags'), { section: 'generation', leaf: 'hashtags' }, 'legacy: hashtags -> generation/hashtags');
eq(resolveContentSetupTarget('todo'), { section: 'workflow', leaf: 'todo' }, 'legacy: todo -> workflow/todo');
eq(resolveContentSetupTarget('shortsQueue'), { section: 'workflow', leaf: 'shortsQueue' }, 'legacy: shortsQueue -> workflow/shortsQueue');
eq(resolveContentSetupTarget('uploadSchedule'), { section: 'workflow', leaf: 'uploadSchedule' }, 'legacy: uploadSchedule -> workflow/uploadSchedule');

// onNavigateToSettings strings the output panels pass (subset of the above)
eq(resolveContentSetupTarget('titles'), { section: 'generation', leaf: 'titles' }, 'nav string: titles');
eq(resolveContentSetupTarget('thumbnails'), { section: 'generation', leaf: 'thumbnails' }, 'nav string: thumbnails');
eq(resolveContentSetupTarget('hashtags'), { section: 'generation', leaf: 'hashtags' }, 'nav string: hashtags');
// The Generator "DESCRIPTIONS" panel now deep-links via the 'long' *leaf id*
// (resolved in ProjectSettingsPage via LEAF_IDS), not the 'descriptions'
// section string — so there is no 'descriptions' nav-string case here any more.
// `resolveContentSetupTarget` doesn't handle leaf ids; a bare leaf id falls
// through to the safe default, which is fine — it's never passed one.
eq(resolveContentSetupTarget('long'), { section: 'project', leaf: 'projectInfo' }, 'resolveContentSetupTarget is not passed leaf ids -> safe default');

// ---------------------------------------------------------------------------
// resolveContentSetupTarget — blocksTarget.subTab (Stage 3: subTab IS the leaf)
// ---------------------------------------------------------------------------

eq(resolveContentSetupTarget('blocks', 'lists'), { section: 'descriptions', leaf: 'lists' }, 'blocks/lists -> descriptions/lists');
eq(resolveContentSetupTarget('blocks', 'text'), { section: 'descriptions', leaf: 'text' }, 'blocks/text -> descriptions/text');
eq(resolveContentSetupTarget('blocks', 'hooks'), { section: 'descriptions', leaf: 'hooks' }, 'blocks/hooks -> descriptions/hooks');
eq(resolveContentSetupTarget('blocks', 'groups'), { section: 'descriptions', leaf: 'groups' }, 'blocks/groups -> descriptions/groups');
eq(resolveContentSetupTarget('blocks', 'placeholders'), { section: 'descriptions', leaf: 'placeholders' }, 'blocks/placeholders -> descriptions/placeholders');

// ---------------------------------------------------------------------------
// resolveContentSetupTarget — new section ids (idempotent) + unknown
// ---------------------------------------------------------------------------

// bare section ids pass through as { section, leaf: null }; ProjectSettingsPage's
// resolveStoredView then fills a leaf for a 'workspace' section (first leaf).
eq(resolveContentSetupTarget('generation'), { section: 'generation', leaf: null }, 'new id: generation -> {generation, null} (resolveStoredView adds the first leaf)');
eq(resolveContentSetupTarget('workflow'), { section: 'workflow', leaf: null }, 'new id: workflow -> page');
eq(resolveContentSetupTarget('project'), { section: 'project', leaf: null }, 'new id: project -> page');
eq(resolveContentSetupTarget('totally-unknown'), { section: 'project', leaf: 'projectInfo' }, 'unknown -> safe default');
eq(resolveContentSetupTarget(undefined), { section: 'project', leaf: 'projectInfo' }, 'undefined -> safe default');

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
