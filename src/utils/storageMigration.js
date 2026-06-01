const UNIFIED_STORAGE_KEY = 'illegalMindGeneratorData';

const PROJECT_IDS = ['illegalMindCovers', 'maxxDeeCovers'];

function safeParse(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function pickProjectsOnly(data) {
  return PROJECT_IDS.reduce((acc, projectId) => {
    acc[projectId] = data?.[projectId] || {};
    return acc;
  }, {});
}

function cleanPanelVisibility(panelVisibility) {
  return {
    titles: Boolean(panelVisibility?.titles),
    descriptions: Boolean(
      panelVisibility?.descriptions ?? panelVisibility?.desriptions,
    ),
    hashtags: Boolean(panelVisibility?.hashtags),
    youtubeTags: Boolean(panelVisibility?.youtubeTags),
    shortHooks: Boolean(panelVisibility?.shortHooks),
    hybridPrompt: Boolean(panelVisibility?.hybridPrompt),
    advanced: Boolean(panelVisibility?.advanced),
  };
}

export function previewUnifiedStorageMigration() {
  const savedEntries = safeParse(localStorage.getItem('savedEntries'), {});
  const tagOverrides = safeParse(localStorage.getItem('tagOverrides'), {});
  const tagVisibilityOverrides = safeParse(
    localStorage.getItem('tagVisibilityOverrides'),
    {},
  );
  const shortsQueues = safeParse(
    localStorage.getItem('shortsQueueByProject'),
    {},
  );
  const panelVisibility = safeParse(
    localStorage.getItem('panelVisibility'),
    {},
  );
  const formData = safeParse(localStorage.getItem('formData'), {});

  const unifiedData = {
    version: 1,

    savedEntries: pickProjectsOnly(savedEntries),
    tagOverrides: pickProjectsOnly(tagOverrides),
    tagVisibilityOverrides: pickProjectsOnly(tagVisibilityOverrides),
    shortsQueues: pickProjectsOnly(shortsQueues),

    ui: {
      selectedProject: localStorage.getItem('selectedProject') || '',
      activePage: localStorage.getItem('activePage') || '',
      showSavedLibrary:
        safeParse(localStorage.getItem('showSavedLibrary'), false) === true,
      advancedOptionsOpen:
        safeParse(localStorage.getItem('advancedOptionsOpen'), false) === true,
      panelVisibility: cleanPanelVisibility(panelVisibility),
    },

    generator: {
      formData,
    },
  };

  const report = {
    storageKey: UNIFIED_STORAGE_KEY,
    savedEntryCounts: Object.fromEntries(
      PROJECT_IDS.map((projectId) => [
        projectId,
        unifiedData.savedEntries[projectId]?.length || 0,
      ]),
    ),
    tagOverrideCounts: Object.fromEntries(
      PROJECT_IDS.map((projectId) => [
        projectId,
        Object.keys(unifiedData.tagOverrides[projectId] || {}).length,
      ]),
    ),
    tagVisibilityProjectKeys: Object.keys(unifiedData.tagVisibilityOverrides),
    queueCounts: Object.fromEntries(
      PROJECT_IDS.map((projectId) => [
        projectId,
        unifiedData.shortsQueues[projectId]?.queue?.length || 0,
      ]),
    ),
    ui: unifiedData.ui,
  };

  return {
    unifiedData,
    report,
  };
}

export function writeUnifiedStorageMigration() {
  const existingUnifiedData = localStorage.getItem(UNIFIED_STORAGE_KEY);

  if (existingUnifiedData) {
    return {
      ok: false,
      reason: `${UNIFIED_STORAGE_KEY} already exists. Migration was not written.`,
    };
  }

  const { unifiedData, report } = previewUnifiedStorageMigration();

  localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(unifiedData));

  return {
    ok: true,
    reason: `${UNIFIED_STORAGE_KEY} created successfully.`,
    report,
  };
}
