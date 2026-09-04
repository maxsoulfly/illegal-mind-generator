// Single source of truth for the top-level route <-> internal page-id
// mapping (the "routing refactor" — see CLAUDE.md's Current Focus / plan
// `C:\Users\Max\.claude\plans\<routing plan>` for the full design). Internal
// page ids (`generator`/`shortsQueue`/`calendar`/`todo`/`tags`/
// `projectSettings`/`uikit`) are unchanged from the pre-routing `activePage`
// state — every existing consumer that compares against these strings
// (`useStaleTargetClearing.js`, `AppHeader`'s title lookup, `App.jsx`'s
// Regenerate-button check) keeps working unmodified once `activePage`
// becomes a value *derived* from the URL instead of a `useState` atom.
//
// `nav: true` entries are the ones AppHeader renders as a top-nav link;
// `uikit` is a real, refresh-safe route but deliberately not a nav item
// (reachable only via the "Open UIKit" button — see AppHeader's history).
export const ROUTES = [
  { id: 'generator', path: '/generator', label: 'Generator', nav: true },
  { id: 'shortsQueue', path: '/queue', label: 'Shorts Queue', nav: true },
  { id: 'calendar', path: '/calendar', label: 'Calendar', nav: true },
  { id: 'todo', path: '/todo', label: 'Todo', nav: true },
  { id: 'tags', path: '/tags', label: 'Tag Library', nav: true },
  { id: 'projectSettings', path: '/content-setup', label: 'Content Setup', nav: true },
  { id: 'uikit', path: '/uikit', label: 'UIKit', nav: false },
];

const ID_TO_PATH = Object.fromEntries(ROUTES.map((r) => [r.id, r.path]));
const PATH_TO_ID = Object.fromEntries(ROUTES.map((r) => [r.path, r.id]));

export const DEFAULT_PAGE_ID = 'generator';
export const DEFAULT_ROUTE_PATH = ID_TO_PATH[DEFAULT_PAGE_ID];

// Any internal page id -> its route path. Unknown/missing id falls back to
// the default route rather than throwing, so a stale/typo'd id never breaks
// navigation outright.
export function pathFromPageId(id) {
  return ID_TO_PATH[id] ?? DEFAULT_ROUTE_PATH;
}

// A URL pathname -> its internal page id. Unknown paths (including the
// bare '/' redirect source and any truly unrecognized route) resolve to the
// default page id, matching the catch-all route's own fallback.
export function pageIdFromPath(pathname) {
  return PATH_TO_ID[pathname] ?? DEFAULT_PAGE_ID;
}
