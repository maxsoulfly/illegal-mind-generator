import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tagOverrides';

const mergeUniqueArray = (target = [], source = []) => {
  return Array.from(new Set([...(target || []), ...(source || [])]));
};

const mergeDescription = (target = {}, source = {}) => ({
  ...target,
  technical: mergeUniqueArray(target.technical, source.technical),
  log: mergeUniqueArray(target.log, source.log),
  status: mergeUniqueArray(target.status, source.status),
});

const mergeShortHooks = (target = {}, source = {}) => {
  const hookTypes = new Set([
    ...Object.keys(target || {}),
    ...Object.keys(source || {}),
  ]);

  return Array.from(hookTypes).reduce((nextHooks, hookType) => {
    return {
      ...nextHooks,
      [hookType]: mergeUniqueArray(target?.[hookType], source?.[hookType]),
    };
  }, {});
};

const mergeTagData = (targetTag = {}, sourceTag = {}) => ({
  ...targetTag,
  title: mergeUniqueArray(targetTag.title, sourceTag.title),
  thumbnail: mergeUniqueArray(targetTag.thumbnail, sourceTag.thumbnail),
  hashtags: mergeUniqueArray(targetTag.hashtags, sourceTag.hashtags),
  description: mergeDescription(targetTag.description, sourceTag.description),
  shortHooks: mergeShortHooks(targetTag.shortHooks, sourceTag.shortHooks),
});

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

  const syncProjectTags = ({
    sourceProjectId,
    targetProjectId,
    sourceTags,
    targetBaseTags,
  }) => {
    if (
      !sourceProjectId ||
      !targetProjectId ||
      sourceProjectId === targetProjectId
    ) {
      return;
    }

    setOverrides((prev) => {
      const targetOverrides = prev[targetProjectId] || {};
      const nextTargetOverrides = { ...targetOverrides };

      Object.entries(sourceTags || {}).forEach(([tagName, sourceTag]) => {
        const targetEffectiveTag = {
          ...(targetBaseTags?.[tagName] || {}),
          ...(targetOverrides[tagName] || {}),
          description: {
            ...(targetBaseTags?.[tagName]?.description || {}),
            ...(targetOverrides[tagName]?.description || {}),
          },
          shortHooks: {
            ...(targetBaseTags?.[tagName]?.shortHooks || {}),
            ...(targetOverrides[tagName]?.shortHooks || {}),
          },
        };

        const tagExistsInTarget =
          Boolean(targetBaseTags?.[tagName]) ||
          Boolean(targetOverrides[tagName]);

        nextTargetOverrides[tagName] = tagExistsInTarget
          ? mergeTagData(targetEffectiveTag, sourceTag)
          : {
              ...sourceTag,
              isCustom: true,
            };
      });

      return {
        ...prev,
        [targetProjectId]: nextTargetOverrides,
      };
    });
  };

  return {
    projectOverrides,
    getTagOverride,
    updateTagOverride,
    resetTagOverride,
    syncProjectTags,
  };
}
