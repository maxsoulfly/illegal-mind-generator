// Patch-builders for the AI Prompts settings editor (Content Setup -> Project
// -> AiPromptsSettings.jsx). Same convention as hookBlockOverrides.js's
// hookBlockAiContexts map: a top-level projectSettingsOverrides key
// (`aiPromptOverrides`) holds ALL prompts' overrides together, keyed by
// prompt id (see aiPromptRegistry.js). Because the server's
// PATCH /project-overrides only shallow-merges at the TOP level (a top-level
// key is replaced wholesale, never deep-merged — see
// server/routes/projectOverrides.js), every write here reads the current
// whole map, replaces only the target prompt's entry, and returns the whole
// map back as the patch. Saving/resetting one prompt must never disturb any
// other prompt's override or any unrelated top-level settings key.
//
// These functions only ever RETURN a patch object — the caller still owns
// calling updateProjectOverride(patch) itself, matching every other
// patch-builder module in this codebase (hookBlockOverrides.js,
// placeholderOverrides.js, blockGroupOverrides.js). resetProjectOverride (the
// DELETE endpoint) must NEVER be used for a single prompt's reset — it
// deletes the whole `aiPromptOverrides` top-level key, wiping every prompt's
// override, not just one.

export function getPromptOverride(projectSettingsOverrides, promptId) {
  return projectSettingsOverrides?.aiPromptOverrides?.[promptId] || null;
}

// `fields` replaces the prompt's ENTIRE override as one unit (unlike
// hookBlockAiContexts' per-field granularity) — "reset" here means "reset
// this whole prompt back to defaults," not one field within it, so there is
// no need for finer-grained per-field storage.
export function updatePromptOverridePatch(projectSettingsOverrides, promptId, fields) {
  return {
    aiPromptOverrides: {
      ...(projectSettingsOverrides?.aiPromptOverrides || {}),
      [promptId]: fields,
    },
  };
}

export function resetPromptOverridePatch(projectSettingsOverrides, promptId) {
  const { [promptId]: _removed, ...remaining } = projectSettingsOverrides?.aiPromptOverrides || {};
  return { aiPromptOverrides: remaining };
}
