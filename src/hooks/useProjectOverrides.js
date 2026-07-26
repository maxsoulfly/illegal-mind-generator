import { useCallback, useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

function getStoredProjectOverrides() {
  const appStorage = loadAppStorage();

  return appStorage.projectOverrides || {};
}

// Stable fallback so a project with no stored settings overrides yet still
// returns the same object reference on every render — a fresh `{}` literal
// here would break resolvedProjectConfig's memoization (App.jsx) and force
// a generation recompute on every unrelated re-render.
const EMPTY_OBJECT = {};

export default function useProjectOverrides(projectId) {
  const [allProjectSettingsOverrides, setAllProjectSettingsOverrides] =
    useState(getStoredProjectOverrides);

  const projectSettingsOverrides = allProjectSettingsOverrides[projectId] || EMPTY_OBJECT;

  const updateProjectOverride = useCallback(
    (updates) => {
      const nextStorage = updateAppStorage((currentStorage) => {
        const currentProjectOverrides =
          currentStorage.projectOverrides?.[projectId] || {};

        return {
          ...currentStorage,
          projectOverrides: {
            ...(currentStorage.projectOverrides || {}),
            [projectId]: {
              ...currentProjectOverrides,
              ...updates,
            },
          },
        };
      });

      setAllProjectSettingsOverrides(nextStorage.projectOverrides || {});
    },
    [projectId],
  );

  const resetProjectOverride = useCallback(
    (fieldName) => {
      const nextStorage = updateAppStorage((currentStorage) => {
        const currentProjectOverrides =
          currentStorage.projectOverrides?.[projectId] || {};

        const nextProjectOverrides = {
          ...currentProjectOverrides,
        };

        delete nextProjectOverrides[fieldName];

        return {
          ...currentStorage,
          projectOverrides: {
            ...(currentStorage.projectOverrides || {}),
            [projectId]: nextProjectOverrides,
          },
        };
      });

      setAllProjectSettingsOverrides(nextStorage.projectOverrides || {});
    },
    [projectId],
  );

  const syncHookTypesToProject = useCallback(
    (targetProjectId, hookTypes) => {
      const nextStorage = updateAppStorage((currentStorage) => {
        const targetOverrides =
          currentStorage.projectOverrides?.[targetProjectId] || {};

        return {
          ...currentStorage,
          projectOverrides: {
            ...(currentStorage.projectOverrides || {}),
            [targetProjectId]: {
              ...targetOverrides,
              shortHookTypes: { ...hookTypes },
            },
          },
        };
      });

      setAllProjectSettingsOverrides(nextStorage.projectOverrides || {});
    },
    [],
  );

  return {
    projectSettingsOverrides,
    updateProjectOverride,
    resetProjectOverride,
    syncHookTypesToProject,
  };
}
