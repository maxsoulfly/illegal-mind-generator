import { generateShortDescriptions } from './generateShortDescriptions';
import { generateBroadcastBlock } from './generateBroadcastBlock';
import { generateTechnicalBlock } from './generateTechnicalBlock';
import { generateLogBlock } from './generateLogBlock';
import { generateCustomBlocks, getEffectiveSongOverrides, resolveHookBlockOutput, renderTextTemplate, resolveHookOverride, pickViableTemplate, isSongOverrideActive } from './generateCustomBlocks';
import { buildTagLine, buildTagPhrase } from './descriptionTagHelpers';
import { buildHookBlockMaps, resolveBlockSource } from '../../utils/descriptionLayout';

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

  // Source attribution for click-to-navigate + hover tooltips (DescriptionsPanel).
  // Block-level granularity — matches what LongDescriptionSettings.jsx's nav
  // arrows already point at, not per-line within a merged block like broadcastBlock.
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const hookBlockMaps = buildHookBlockMaps(projectConfig.description?.hookBlocks || []);
  const supportBlockConfig = projectConfig.description?.templates?.long?.supportBlock;

  const longDescriptionSegments = layout
    .map((blockName) => {
      let text;
      if (blockName in blocks) {
        text = blocks[blockName];
      } else {
        const hookSongOverride = resolveHookOverride(songOverrides[blockName]);
        text = hookSongOverride
          ? renderTextTemplate(hookSongOverride, projectConfig, formData, tagPhrase)
          : resolveHookBlockOutput(blockName, ctx)?.text;
      }
      if (!text) return null;
      // logBlock's override only fills the {logNote} placeholder inside a
      // still-pool-picked template — it's a partial substitution, not a full
      // replacement, so the Hook Blocks pool stays the accurate source for it.
      const overridden = blockName !== 'logBlock' && isSongOverrideActive(songOverrides, blockName);
      const source = resolveBlockSource(blockName, { hookBlockMaps, customBlocks, supportBlockConfig, overridden });
      return { text, source };
    })
    .filter(Boolean);

  const longDescription = longDescriptionSegments.map((segment) => segment.text).join('\n\n');

  // --- Shorts ---
  const { shortDescriptions, shortDescriptionSegments } = generateShortDescriptions(
    formData,
    projectConfig,
    shortHooks,
    tagPhrase,
  );

  return {
    shortDescriptions,
    shortDescriptionSegments,
    longDescription,
    longDescriptionSegments,
    fileId,
  };
}
