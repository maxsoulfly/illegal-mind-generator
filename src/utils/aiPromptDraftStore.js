// A plain module-level store (NOT React state) so an unsaved AI Prompts
// draft survives a project switch, not just a prompt-selector switch.
//
// App.jsx shows a blocking full-app "Loading..." screen while
// useProjectOverrides/useTagOverrides/useSavedEntries refetch for a newly
// selected project (see App.jsx's tagOverridesLoading || projectOverridesLoading
// || savedEntriesLoading gate) — this unmounts the entire React tree,
// AiPromptsSettings included, on every project switch. A plain useState
// inside that component would be destroyed and recreated by that
// unmount/remount, losing any unsaved draft. A module-level object is not
// reset by a component unmounting — only a full page reload re-evaluates
// this module — so it survives a project switch exactly the way any other
// in-memory JS value outside React would.
//
// Read via useSyncExternalStore (React 18+) so components still re-render
// correctly when an entry changes.

const store = new Map(); // key: `${projectId}:${promptId}` -> { fields, pasteText, applySummary }
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getDraftEntry(key) {
  return store.get(key) || null;
}

export function setDraftEntry(key, entry) {
  store.set(key, entry);
  notify();
}

export function clearDraftEntry(key) {
  store.delete(key);
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
