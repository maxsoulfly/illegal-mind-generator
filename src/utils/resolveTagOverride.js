// One-level-deep "override wins" merge for resolving a tag against its
// stored override — flat fields let override replace base outright,
// description/shortHooks merge one level deeper so an override touching
// only e.g. description.log doesn't wipe technical/status. Deliberately
// different from useTagOverrides.js's Set-union sync merge (mergeTagData) —
// don't consolidate the two, sync combines two tags' content pools, this
// lets a single tag's override win over its base.
export function resolveTagOverride(baseTag = {}, override = {}) {
  return {
    ...baseTag,
    ...override,
    description: {
      ...(baseTag.description || {}),
      ...(override.description || {}),
    },
    shortHooks: {
      ...(baseTag.shortHooks || {}),
      ...(override.shortHooks || {}),
    },
  };
}
