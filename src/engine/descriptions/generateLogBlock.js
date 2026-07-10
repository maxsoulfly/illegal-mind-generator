import { pickViableTemplate } from '../placeholders';

// {logNote} (the song override / logNotes pool pick) is resolved generically
// by the placeholders registry now — this file only still needs its own
// function for the tag-specific merge (selected tags' own description.log
// lines joined with the project-level wrapper), the same pattern as
// generateBroadcastBlock.js/generateTechnicalBlock.js.
export function generateLogBlock(
  selectedTags,
  projectConfig,
  formData,
  tagLine,
) {
  const tagRegistry = projectConfig?.tags || {};
  const ctx = { formData, projectConfig, tagLine };

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  const logLines = selectedTags.flatMap((tag) => getDescriptionTag(tag).log || []);
  const tagLogBlock = pickViableTemplate(logLines, ctx)?.text ?? '';

  const baseLogBlock =
    pickViableTemplate(projectConfig?.description.templates?.long?.logBlock || [], ctx)?.text ?? '';

  return [baseLogBlock, tagLogBlock].filter(Boolean).join('\n');
}
