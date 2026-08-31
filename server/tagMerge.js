// Intentional temporary duplicate of the pure merge functions in
// src/hooks/useTagOverrides.js (mergeUniqueArray/mergeDescription/
// mergeShortHooks/mergeTagData). Phase A steps make zero changes to src/ on
// purpose (see the persistence plan's migration execution constraint) — this
// is copied rather than imported so this step doesn't touch app code at all.
// Consolidate into one shared module when Step 8 touches
// useTagOverrides.js for the real hook swap; until then, any change to the
// merge algorithm on one side must be mirrored to the other by hand.

export const mergeUniqueArray = (target = [], source = []) => {
  return Array.from(new Set([...(target || []), ...(source || [])]));
};

export const mergeDescription = (target = {}, source = {}) => ({
  ...target,
  technical: mergeUniqueArray(target.technical, source.technical),
  log: mergeUniqueArray(target.log, source.log),
  status: mergeUniqueArray(target.status, source.status),
});

export const mergeShortHooks = (target = {}, source = {}) => {
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

export const mergeTagData = (targetTag = {}, sourceTag = {}) => ({
  ...sourceTag,
  ...targetTag,
  title: mergeUniqueArray(targetTag.title, sourceTag.title),
  thumbnail: mergeUniqueArray(targetTag.thumbnail, sourceTag.thumbnail),
  hashtags: mergeUniqueArray(targetTag.hashtags, sourceTag.hashtags),
  description: mergeDescription(targetTag.description, sourceTag.description),
  shortHooks: mergeShortHooks(targetTag.shortHooks, sourceTag.shortHooks),
});

export const buildEffectiveTag = (baseTag = {}, override = {}) => ({
  ...baseTag,
  ...override,
  description: mergeDescription(baseTag.description, override.description),
  shortHooks: mergeShortHooks(baseTag.shortHooks, override.shortHooks),
});
