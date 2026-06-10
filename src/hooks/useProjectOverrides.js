import { useCallback, useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

function getStoredProjectOverrides() {
  const appStorage = loadAppStorage();

  return appStorage.projectOverrides || {};
}

export default function useProjectOverrides(projectId) {
  const [allProjectSettingsOverrides, setAllProjectSettingsOverrides] =
    useState(getStoredProjectOverrides);

  const projectSettingsOverrides = allProjectSettingsOverrides[projectId] || {};

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

  return {
    projectSettingsOverrides,
    updateProjectOverride,
    resetProjectOverride,
  };
}
