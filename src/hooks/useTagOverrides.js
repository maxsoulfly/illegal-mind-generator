import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tagOverrides';

export default function useTagOverrides(projectId) {
  const [overrides, setOverrides] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const projectOverrides = overrides[projectId] || {};

  const getTagOverride = (tagName) => {
    return projectOverrides[tagName] || {};
  };

  const updateTagOverride = (tagName, updates) => {
    setOverrides((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {}),
        [tagName]: {
          ...(prev[projectId]?.[tagName] || {}),
          ...updates,
        },
      },
    }));
  };

  const resetTagOverride = (tagName) => {
    setOverrides((prev) => {
      const projectData = { ...(prev[projectId] || {}) };
      delete projectData[tagName];

      return {
        ...prev,
        [projectId]: projectData,
      };
    });
  };

  return {
    projectOverrides,
    getTagOverride,
    updateTagOverride,
    resetTagOverride,
  };
}
