const STORAGE_KEY = 'illegalMindGeneratorData';

const defaultStorage = {
  version: 1,
  savedEntries: {},
  tagOverrides: {},
  tagVisibilityOverrides: {},
  shortsQueues: {},
  ui: {
    selectedProject: '',
    activePage: '',
    showSavedLibrary: false,
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
