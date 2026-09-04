const STORAGE_KEY = 'illegalMindGeneratorData';

// `ui.activePage` (top-level page selection) is intentionally not in this
// shape — the routing refactor made the URL the single source of truth for
// that (src/config/routes.js), and it is no longer read or written anywhere.
// Any real user's already-persisted `ui.activePage` value is simply carried
// forward untouched by the `...stored.ui` spread below and never consulted.
const defaultStorage = {
  version: 1,
  savedEntries: {},
  tagOverrides: {},
  tagVisibilityOverrides: {},
  shortsQueues: {},
  uploadCalendar: {},
  projectOverrides: {},
  ui: {
    selectedProject: '',
    showSavedLibrary: false,
    hideQueueHidden: false,
    advancedOptionsOpen: false,
    panelVisibility: {},
  },
  generator: {
    formData: {},
  },
};

export function loadAppStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return stored
      ? {
          ...defaultStorage,
          ...stored,
          projectOverrides: {
            ...defaultStorage.projectOverrides,
            ...stored.projectOverrides,
          },
          ui: {
            ...defaultStorage.ui,
            ...stored.ui,
          },
          generator: {
            ...defaultStorage.generator,
            ...stored.generator,
          },
        }
      : defaultStorage;
  } catch {
    return defaultStorage;
  }
}

export function saveAppStorage(nextStorage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStorage));
}

export function updateAppStorage(updater) {
  const currentStorage = loadAppStorage();
  const nextStorage = updater(currentStorage);

  saveAppStorage(nextStorage);

  return nextStorage;
}
