import { useEffect, useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

const LEGACY_STORAGE_KEY = 'tagOverrides';

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

// Flat scalar fields (label, category, visible, etc.) aren't in this list —
// they fall through via the two spreads below. sourceTag is spread first so
// its values fill in for a tag that doesn't exist in the target yet; targetTag
// is spread second so an existing tag's own scalar settings still win.
export const mergeTagData = (targetTag = {}, sourceTag = {}) => ({
  ...sourceTag,
  ...targetTag,
  title: mergeUniqueArray(targetTag.title, sourceTag.title),
  thumbnail: mergeUniqueArray(targetTag.thumbnail, sourceTag.thumbnail),
  hashtags: mergeUniqueArray(targetTag.hashtags, sourceTag.hashtags),
  description: mergeDescription(targetTag.description, sourceTag.description),
  shortHooks: mergeShortHooks(targetTag.shortHooks, sourceTag.shortHooks),
});

export default function useTagOverrides(projectId) {
  const [overrides, setOverrides] = useState(() => {
    const unified = loadAppStorage().tagOverrides;

    if (unified && Object.keys(unified).length > 0) {
      return unified;
    }

    const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    const legacy = saved ? JSON.parse(saved) : {};

    if (Object.keys(legacy).length > 0) {
      updateAppStorage((storage) => ({ ...storage, tagOverrides: legacy }));
    }

    return legacy;
  });

  useEffect(() => {
    updateAppStorage((storage) => ({ ...storage, tagOverrides: overrides }));
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
    sourceBaseTags,
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
      // Read raw overrides directly from prev — guaranteed to be latest state.
      const sourceOverrides = prev[sourceProjectId] || {};
      const targetOverrides = prev[targetProjectId] || {};
      const nextTargetOverrides = { ...targetOverrides };

      const buildEffective = (baseTag = {}, override = {}) => ({
        ...baseTag,
        ...override,
        description: mergeDescription(baseTag.description, override.description),
        shortHooks: mergeShortHooks(baseTag.shortHooks, override.shortHooks),
      });

      const processedTags = new Set();

      // Step 1: process source overrides (custom tags + base tags with user edits).
      // These have the highest fidelity since they include actual user additions.
      Object.entries(sourceOverrides).forEach(([tagName, sourceOverride]) => {
        processedTags.add(tagName);

        const sourceEffective = buildEffective(
          sourceBaseTags?.[tagName],
          sourceOverride,
        );
        const targetEffective = buildEffective(
          targetBaseTags?.[tagName],
          targetOverrides[tagName],
        );

        const tagExistsInTarget =
          Boolean(targetBaseTags?.[tagName]) || Boolean(targetOverrides[tagName]);

        nextTargetOverrides[tagName] = tagExistsInTarget
          ? mergeTagData(targetEffective, sourceEffective)
          : { ...sourceOverride, isCustom: true };
      });

      // Step 2: merge base-only source tags that had no overrides.
      // Copies project-specific base templates into target's overrides.
      Object.entries(sourceBaseTags || {}).forEach(([tagName, sourceBaseTag]) => {
        if (processedTags.has(tagName)) return;

        const targetEffective = buildEffective(
          targetBaseTags?.[tagName],
          targetOverrides[tagName],
        );

        nextTargetOverrides[tagName] = mergeTagData(targetEffective, sourceBaseTag);
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
