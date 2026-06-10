import { useCallback, useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

function getStoredProjectOverrides(projectId) {
  const appStorage = loadAppStorage();

  return appStorage.projectOverrides?.[projectId] || {};
}

export default function useProjectOverrides(projectId) {
  const [projectSettingsOverrides, setProjectSettingsOverrides] = useState(() =>
    getStoredProjectOverrides(projectId),
  );

  const updateProjectOverride = useCallback(
    (updates) => {
      const nextStorage = updateAppStorage((currentStorage) => {
        const currentProjectOverrides =
          currentStorage.projectOverrides?.[projectId] || {};

        const nextProjectOverrides = {
          ...currentProjectOverrides,
          ...updates,
        };

        return {
          ...currentStorage,
          projectOverrides: {
            ...(currentStorage.projectOverrides || {}),
            [projectId]: nextProjectOverrides,
          },
        };
      });

      setProjectSettingsOverrides(
        nextStorage.projectOverrides?.[projectId] || {},
      );
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

      setProjectSettingsOverrides(
        nextStorage.projectOverrides?.[projectId] || {},
      );
    },
    [projectId],
  );

  return {
    projectSettingsOverrides,
    updateProjectOverride,
    resetProjectOverride,
  };
}
