import { generateShortDescriptions } from './generateShortDescriptions';
import { generateBroadcastBlock } from './generateBroadcastBlock';
import { generateTechnicalBlock } from './generateTechnicalBlock';
import { generateLogBlock } from './generateLogBlock';
import { generateCustomBlocks, getEffectiveSongOverrides, resolveHookBlockOutput, renderTextTemplate, resolveHookOverride, pickViableTemplate } from './generateCustomBlocks';
import { buildTagLine, buildTagPhrase } from './descriptionTagHelpers';

export function generateDescriptions(formData, projectConfig, shortHooks = []) {
  const tagLine = buildTagLine(formData, projectConfig);
  const tagPhrase = buildTagPhrase(formData, projectConfig);
  const selectedTags = formData.transformationTags || [];
  const ctx = { formData, projectConfig, tagLine: tagPhrase };

  // --- Broadcast block ---
  const { broadcastBlock, fileId } = generateBroadcastBlock(
    formData,
    projectConfig,
    selectedTags,
  );

  // --- Song overrides (needed by intro, story, log, and dynamic hook blocks) ---
  const songOverrides = getEffectiveSongOverrides(formData);

  // --- Intro block ---
  const introOverride = resolveHookOverride(songOverrides.introBlock);
  const introBlock = introOverride
    ? renderTextTemplate(introOverride, projectConfig, formData, tagPhrase)
    : pickViableTemplate(projectConfig?.description.templates?.long?.introHook || [], ctx)?.text ?? '';

  // --- Story block ---
  const storyOverride = resolveHookOverride(songOverrides.storyBlock);
  const storyBlock = storyOverride
    ? renderTextTemplate(storyOverride, projectConfig, formData, tagPhrase)
    : pickViableTemplate(projectConfig?.description.templates?.long?.storyBlock || [], ctx)?.text ?? '';

  // --- Philosophy block ---
  const philosophyBlock = pickViableTemplate(projectConfig?.description.templates?.long?.philosophyLine || [], ctx)?.text ?? '';

  // --- Closing block ---
  const closingPicked = pickViableTemplate(projectConfig?.description.templates?.long?.closingSignal || [], ctx);
  const closingBlock = (closingPicked?.text ?? '').replace(
    /\{num\}/g,
    formData.signalNumber || '00',
  );

  const closingCombined = [closingBlock, philosophyBlock]
    .filter(Boolean)
    .join('\n');

  // --- Technical block ---
  const technicalBlock = generateTechnicalBlock(selectedTags, projectConfig, formData);

  // --- Log block ---
  const logBlock = generateLogBlock(
    selectedTags,
    projectConfig,
    formData,
    tagLine,
  );

  // --- Long description ---
  if (!projectConfig?.description.templates?.long?.layout) {
    throw new Error('Missing description layout in project config');
  }

  // --- Custom blocks ---
  const { renderedCustomBlocks, supportBlock } =
    generateCustomBlocks(formData, projectConfig, tagLine);

  const layout = projectConfig.description.templates.long.layout;
  const blocks = {
    broadcastBlock,
    introBlock,
    storyBlock,
    technicalBlock,
    logBlock,
    closingBlock: closingCombined,
    supportBlock,
    ...renderedCustomBlocks,
  };

  const longDescription = layout
    .map((blockName) => {
      if (blockName in blocks) return blocks[blockName];
      const hookSongOverride = resolveHookOverride(songOverrides[blockName]);
      if (hookSongOverride) return renderTextTemplate(hookSongOverride, projectConfig, formData, tagPhrase);
      return resolveHookBlockOutput(blockName, ctx) ?? undefined;
    })
    .filter(Boolean)
    .join('\n\n');

  // --- Shorts ---
  const shortDescriptions = generateShortDescriptions(
    formData,
    projectConfig,
    shortHooks,
    tagPhrase,
  );

  return {
    shortDescriptions,
    longDescription,
    fileId,
  };
}
