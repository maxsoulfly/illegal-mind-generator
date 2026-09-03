// Smoke test for contentSetupNav.js — the pure navigation model behind the
// Project Settings -> "Content Setup" IA rework (Stage 0). Guards the
// section registry, the legacy-id -> {section, leaf} resolver (incl. the
// 'descriptions' legacy/new-id collision and the blocksTarget.subTab
// handling), the leaf-list helpers, and parentOf back-nav.
//
// Run: npx rolldown src/config/contentSetupNav.test.js -f esm -p node \
//        -o /tmp/csn.test.mjs && node /tmp/csn.test.mjs

import {
  CONTENT_SETUP_SECTIONS,
  resolveContentSetupTarget,
  getSection,
  getSectionLeaves,
  isValidLeaf,
  parentOf,
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
  ['drill', 'subnav', 'page', 'page'],
  'registry: generation=drill, descriptions=subnav, workflow/project=page',
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
  ['layout', 'blocks', 'placeholders', 'links'],
  'registry: descriptions leaves',
);
eq(
  getSectionLeaves('workflow').map((l) => l.id),
  ['shortsQueue', 'todo', 'uploadSchedule'],
  'registry: workflow leaves',
);
eq(getSectionLeaves('project').map((l) => l.id), ['projectInfo', 'backup'], 'registry: project leaves');
ok(getSection('nope') === null && getSectionLeaves('nope').length === 0, 'registry: unknown section -> null / []');

// ---------------------------------------------------------------------------
// resolveContentSetupTarget — all 11 legacy PROJECT_SETTING_SECTIONS ids
// ---------------------------------------------------------------------------

eq(resolveContentSetupTarget('general'), { section: 'project', leaf: 'projectInfo' }, 'legacy: general -> project/projectInfo');
eq(resolveContentSetupTarget('shortHooks'), { section: 'generation', leaf: 'shortHooks' }, 'legacy: shortHooks -> generation/shortHooks');
eq(resolveContentSetupTarget('titles'), { section: 'generation', leaf: 'titles' }, 'legacy: titles -> generation/titles');
eq(resolveContentSetupTarget('descriptions'), { section: 'descriptions', leaf: 'layout' }, 'legacy: descriptions -> descriptions/layout (NOT the bare-section passthrough)');
eq(resolveContentSetupTarget('links'), { section: 'descriptions', leaf: 'links' }, 'legacy: links -> descriptions/links');
eq(resolveContentSetupTarget('blocks'), { section: 'descriptions', leaf: 'blocks' }, 'legacy: blocks (no subTab) -> descriptions/blocks');
eq(resolveContentSetupTarget('thumbnails'), { section: 'generation', leaf: 'thumbnails' }, 'legacy: thumbnails -> generation/thumbnails');
eq(resolveContentSetupTarget('hashtags'), { section: 'generation', leaf: 'hashtags' }, 'legacy: hashtags -> generation/hashtags');
eq(resolveContentSetupTarget('todo'), { section: 'workflow', leaf: 'todo' }, 'legacy: todo -> workflow/todo');
eq(resolveContentSetupTarget('shortsQueue'), { section: 'workflow', leaf: 'shortsQueue' }, 'legacy: shortsQueue -> workflow/shortsQueue');
eq(resolveContentSetupTarget('uploadSchedule'), { section: 'workflow', leaf: 'uploadSchedule' }, 'legacy: uploadSchedule -> workflow/uploadSchedule');

// onNavigateToSettings strings the output panels pass (subset of the above)
eq(resolveContentSetupTarget('titles'), { section: 'generation', leaf: 'titles' }, 'nav string: titles');
eq(resolveContentSetupTarget('thumbnails'), { section: 'generation', leaf: 'thumbnails' }, 'nav string: thumbnails');
eq(resolveContentSetupTarget('hashtags'), { section: 'generation', leaf: 'hashtags' }, 'nav string: hashtags');
eq(resolveContentSetupTarget('descriptions'), { section: 'descriptions', leaf: 'layout' }, 'nav string: descriptions');

// ---------------------------------------------------------------------------
// resolveContentSetupTarget — blocksTarget.subTab
// ---------------------------------------------------------------------------

eq(
  resolveContentSetupTarget('blocks', 'lists'),
  { section: 'descriptions', leaf: 'blocks', blocksSubTab: 'lists' },
  'blocks/lists -> descriptions/blocks, subTab passed through',
);
eq(
  resolveContentSetupTarget('blocks', 'text'),
  { section: 'descriptions', leaf: 'blocks', blocksSubTab: 'text' },
  'blocks/text -> descriptions/blocks + subTab',
);
eq(
  resolveContentSetupTarget('blocks', 'hooks'),
  { section: 'descriptions', leaf: 'blocks', blocksSubTab: 'hooks' },
  'blocks/hooks -> descriptions/blocks + subTab',
);
eq(
  resolveContentSetupTarget('blocks', 'groups'),
  { section: 'descriptions', leaf: 'blocks', blocksSubTab: 'groups' },
  'blocks/groups -> descriptions/blocks + subTab',
);
eq(
  resolveContentSetupTarget('blocks', 'placeholders'),
  { section: 'descriptions', leaf: 'placeholders' },
  'blocks/placeholders -> its own descriptions/placeholders leaf (no blocksSubTab)',
);

// ---------------------------------------------------------------------------
// resolveContentSetupTarget — new section ids (idempotent) + unknown
// ---------------------------------------------------------------------------

eq(resolveContentSetupTarget('generation'), { section: 'generation', leaf: null }, 'new id: generation -> overview');
eq(resolveContentSetupTarget('workflow'), { section: 'workflow', leaf: null }, 'new id: workflow -> page');
eq(resolveContentSetupTarget('project'), { section: 'project', leaf: null }, 'new id: project -> page');
eq(resolveContentSetupTarget('totally-unknown'), { section: 'project', leaf: 'projectInfo' }, 'unknown -> safe default');
eq(resolveContentSetupTarget(undefined), { section: 'project', leaf: 'projectInfo' }, 'undefined -> safe default');

// ---------------------------------------------------------------------------
// isValidLeaf
// ---------------------------------------------------------------------------

ok(isValidLeaf('generation', 'titles'), 'isValidLeaf: generation/titles');
ok(!isValidLeaf('generation', 'links'), 'isValidLeaf: generation/links is false');
ok(isValidLeaf('descriptions', 'placeholders'), 'isValidLeaf: descriptions/placeholders');
ok(!isValidLeaf('nope', 'titles'), 'isValidLeaf: unknown section -> false');

// ---------------------------------------------------------------------------
// parentOf
// ---------------------------------------------------------------------------

eq(
  parentOf({ section: 'generation', leaf: 'titles' }),
  { section: 'generation', leaf: null },
  'parentOf: leaf -> section overview',
);
ok(parentOf({ section: 'generation', leaf: null }) === null, 'parentOf: section overview -> null');
ok(parentOf(null) === null, 'parentOf: null -> null');

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
