// Builds a paste-into-an-AI-chat prompt for generating cover-specific Short
// Hooks (formData.coverShortHooks — a flat, uncategorized per-cover list).
//
// The prompt body now lives in the shared "Copy AI Prompt" infrastructure:
// coverShortHooksContext (authorPromptContexts.js) supplies the sections,
// buildAuthorPrompt (authorPrompt.js) assembles them. This wrapper is kept so
// the existing import in CoverShortHooksEditor.jsx and the smoke tests don't
// move. Output is byte-frozen against the pre-refactor implementation by
// coverPrompt.test.js — see the note in authorPromptContexts.js before
// touching cover's wording.
//
// One-way, like the other buildXPrompt helpers: this app is local-first and
// never calls an AI itself; the editor's Bulk Add box is the return path.

import { buildAuthorPrompt } from './authorPrompt';
import { coverShortHooksContext } from './authorPromptContexts';

export function buildCoverHookPrompt(formData = {}, projectConfig = {}) {
  return buildAuthorPrompt(coverShortHooksContext(projectConfig, formData));
}
