import { useEffect, useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

const LEGACY_STORAGE_KEY = 'tagVisibilityOverrides';

export default function useTagVisibilityOverrides(projectId) {
  const [overrides, setOverrides] = useState(() => {
    const unified = loadAppStorage().tagVisibilityOverrides;

    if (unified && Object.keys(unified).length > 0) {
      return unified;
    }

    const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    const legacy = saved ? JSON.parse(saved) : {};

    if (Object.keys(legacy).length > 0) {
      updateAppStorage((storage) => ({
        ...storage,
        tagVisibilityOverrides: legacy,
      }));
    }

    return legacy;
  });

  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      tagVisibilityOverrides: overrides,
    }));
  }, [overrides]);

  const projectOverrides = overrides[projectId] || {};

  const getVisibilityOverride = (tagName) => {
    return projectOverrides[tagName];
  };

  const setTagVisibility = (tagName, isVisible) => {
    setOverrides((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {}),
        [tagName]: isVisible,
      },
    }));
  };

  const toggleTagVisibility = (tagName, currentVisible) => {
    setTagVisibility(tagName, !currentVisible);
  };

  return {
    projectOverrides,
    getVisibilityOverride,
    setTagVisibility,
    toggleTagVisibility,
  };
}
