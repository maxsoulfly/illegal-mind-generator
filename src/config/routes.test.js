// Smoke test for routes.js — the single source of truth for the top-level
// route <-> internal page-id mapping behind the routing refactor (react-
// router-dom). Guards the id<->path table itself plus the default-route /
// unknown-route fallback behavior that / and the catch-all route rely on.
//
// Run: npx rolldown src/config/routes.test.js -f esm -p node \
//        -o /tmp/routes.test.mjs && node /tmp/routes.test.mjs

import {
  ROUTES,
  DEFAULT_PAGE_ID,
  DEFAULT_ROUTE_PATH,
  pathFromPageId,
  pageIdFromPath,
} from './routes';

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`);
  if (!cond) failures++;
};
const eq = (a, b, msg) =>
  ok(JSON.stringify(a) === JSON.stringify(b), `${msg}\n    got ${JSON.stringify(a)}`);

// ---------------------------------------------------------------------------
// registry shape
// ---------------------------------------------------------------------------

eq(
  ROUTES.map((r) => r.id),
  ['generator', 'shortsQueue', 'calendar', 'todo', 'tags', 'projectSettings', 'uikit'],
  'registry: all 7 top-level page ids present, in nav display order',
);

ok(new Set(ROUTES.map((r) => r.id)).size === ROUTES.length, 'registry: every id is unique');
ok(new Set(ROUTES.map((r) => r.path)).size === ROUTES.length, 'registry: every path is unique');
ok(
  ROUTES.every((r) => r.path.startsWith('/')),
  'registry: every path is absolute (starts with /)',
);

eq(
  ROUTES.filter((r) => r.nav).map((r) => r.id),
  ['generator', 'shortsQueue', 'calendar', 'todo', 'tags', 'projectSettings'],
  'registry: uikit is the only route excluded from the top nav (nav: false)',
);

// ---------------------------------------------------------------------------
// pathFromPageId: id -> expected path (every page id documented for the
// routing refactor)
// ---------------------------------------------------------------------------

const expectedPaths = {
  generator: '/generator',
  shortsQueue: '/queue',
  calendar: '/calendar',
  todo: '/todo',
  tags: '/tags',
  projectSettings: '/content-setup',
  uikit: '/uikit',
};

for (const [id, path] of Object.entries(expectedPaths)) {
  eq(pathFromPageId(id), path, `pathFromPageId('${id}') -> '${path}'`);
}

ok(
  pathFromPageId('not-a-real-page-id') === DEFAULT_ROUTE_PATH,
  'pathFromPageId: an unknown id falls back to the default route path, not undefined/throw',
);

// ---------------------------------------------------------------------------
// pageIdFromPath: path -> expected id (the inverse mapping App.jsx derives
// activePage from)
// ---------------------------------------------------------------------------

for (const [id, path] of Object.entries(expectedPaths)) {
  eq(pageIdFromPath(path), id, `pageIdFromPath('${path}') -> '${id}'`);
}

ok(
  pageIdFromPath('/this-route-does-not-exist') === DEFAULT_PAGE_ID,
  'pageIdFromPath: an unknown path resolves to the default page id, matching the catch-all route\'s own fallback',
);
ok(
  pageIdFromPath('/') === DEFAULT_PAGE_ID,
  'pageIdFromPath: the bare root (never a real page id) also resolves to the default page id',
);

// ---------------------------------------------------------------------------
// defaults: what / and the catch-all route redirect to
// ---------------------------------------------------------------------------

ok(DEFAULT_PAGE_ID === 'generator', 'DEFAULT_PAGE_ID is generator');
ok(DEFAULT_ROUTE_PATH === '/generator', 'DEFAULT_ROUTE_PATH is /generator');
ok(
  pathFromPageId(DEFAULT_PAGE_ID) === DEFAULT_ROUTE_PATH,
  'DEFAULT_PAGE_ID and DEFAULT_ROUTE_PATH agree with each other via pathFromPageId',
);

if (failures > 0) throw new Error(`${failures} check(s) failed.`);
console.log('\nAll checks passed.');
