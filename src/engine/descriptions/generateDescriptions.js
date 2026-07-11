import { generateShortDescriptions } from './generateShortDescriptions';
import { generateBroadcastBlock } from './generateBroadcastBlock';
import { generateTechnicalBlock } from './generateTechnicalBlock';
import { generateLogBlock } from './generateLogBlock';
import { generateCustomBlocks, generateBlockGroups, getEffectiveSongOverrides, resolveLayoutKey, renderTextTemplate, resolveHookOverride, pickViableTemplate, isSongOverrideActive } from './generateCustomBlocks';
import { buildTagLine, buildTagPhrase } from './descriptionTagHelpers';
import { buildHookBlockMaps, buildBlockGroupMaps, resolveBlockSource } from '../../utils/descriptionLayout';

export function generateDescriptions(formData, projectConfig, shortHooks = []) {
  const tagLine = buildTagLine(formData, projectConfig);
  const tagPhrase = buildTagPhrase(formData, projectConfig);
  const selectedTags = formData.transformationTags || [];
  // {num} isn't a REGISTRY token (its fallback text differs per caller — see
  // placeholders.js) but Closing Signal needs it filled wherever it renders,
  // including standalone as a Block Group child, so it's set once here rather
  // than hand-replaced after the fact like the old inline closingBlock logic did.
  const ctx = {
    formData,
    projectConfig,
    tagLine: tagPhrase,
    overrides: { num: formData.signalNumber || '00' },
  };

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
  const baseBlocks = {
    broadcastBlock,
    introBlock,
    storyBlock,
    technicalBlock,
    logBlock,
    supportBlock,
    ...renderedCustomBlocks,
  };
  // Block Groups (e.g. closingBlock = closingSignal + philosophyLine) resolve
  // their children through the same resolveLayoutKey the top-level layout
  // loop below uses, then get merged in as ordinary blocks — a group key
  // becomes just another `blockName in blocks` hit, no special-casing needed
  // in the loop itself.
  const blockGroups = projectConfig.description?.blockGroups || [];
  const blocks = {
    ...baseBlocks,
    ...generateBlockGroups(blockGroups, ctx, baseBlocks, songOverrides),
  };

  // Source attribution for click-to-navigate + hover tooltips (DescriptionsPanel).
  // Block-level granularity — matches what LongDescriptionSettings.jsx's nav
  // arrows already point at, not per-line within a merged block like broadcastBlock.
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const hookBlockMaps = buildHookBlockMaps(projectConfig.description?.hookBlocks || []);
  const blockGroupMaps = buildBlockGroupMaps(blockGroups);
  const supportBlockConfig = projectConfig.description?.templates?.long?.supportBlock;

  const longDescriptionSegments = layout
    .map((blockName) => {
      const text = resolveLayoutKey(blockName, ctx, blocks, songOverrides);
      if (!text) return null;
      // logBlock's override only fills the {logNote} placeholder inside a
      // still-pool-picked template — it's a partial substitution, not a full
      // replacement, so the Hook Blocks pool stays the accurate source for it.
      const overridden = blockName !== 'logBlock' && isSongOverrideActive(songOverrides, blockName);
      const source = resolveBlockSource(blockName, { hookBlockMaps, customBlocks, supportBlockConfig, blockGroupMaps, overridden });
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
