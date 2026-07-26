// Standalone leaf module (zero imports) by design — both generateShortHooks.js
// and hookBlockLookup.js need this filter, but they can't import each other:
// hookBlockLookup.js is imported by placeholders.js, which is imported by
// generateShortHooks.js, so hookBlockLookup.js importing generateShortHooks.js
// would close an import cycle. Keep this file dependency-free.
export function getEligibleShortHookTypeEntries(formData, projectConfig) {
  const hookTypes = projectConfig.shortHookTypes || {};
  const isFaithful = (formData.transformationTags || []).includes('faithful');
  const hasGenre = !!(formData.originalGenre?.trim());

  return Object.entries(hookTypes).filter(([, hookConfig]) => {
    if (isFaithful && hookConfig.excludeForFaithful) return false;
    if (hookConfig.requiresGenre && !hasGenre) return false;
    return true;
  });
}
