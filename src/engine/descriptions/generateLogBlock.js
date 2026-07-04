import { pickViableTemplate } from '../placeholders';
import { getEffectiveSongOverrides, renderTextTemplate, resolveHookOverride } from './generateCustomBlocks';

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

  const logNotes = projectConfig?.description.templates?.long?.logNotes || [];
  const defaultLogNote =
    pickViableTemplate(logNotes, ctx)?.text ??
    projectConfig?.description.templates?.long?.defaultLogNote ??
    'Signal stabilized.';

  const songOverrides = getEffectiveSongOverrides(formData);
  const logOverride = resolveHookOverride(songOverrides.logBlock);
  const logNote = logOverride
    ? renderTextTemplate(logOverride, projectConfig, formData, tagLine)
    : defaultLogNote;

  const logTemplatePicked = pickViableTemplate(
    projectConfig?.description.templates?.long?.logBlock || [],
    { ...ctx, overrides: { logNote } },
  );
  const baseLogBlock = logTemplatePicked?.text ?? '';

  return [baseLogBlock, tagLogBlock].filter(Boolean).join('\n');
}
