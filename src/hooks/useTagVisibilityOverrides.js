import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tagVisibilityOverrides';

export default function useTagVisibilityOverrides(projectId) {
  const [overrides, setOverrides] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
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
