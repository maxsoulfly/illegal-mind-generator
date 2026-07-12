import { generateShortDescriptions } from './generateShortDescriptions';
import { generateTechnicalBlock } from './generateTechnicalBlock';
import { generateCustomBlocks, generateBlockGroups, getEffectiveSongOverrides, resolveLayoutKey, renderTextTemplate, resolveHookOverride, pickViableTemplate, isSongOverrideActive } from './generateCustomBlocks';
import { buildTagLine, buildTagPhrase } from './descriptionTagHelpers';
import { buildHookBlockMaps, buildBlockGroupMaps, resolveBlockSource } from '../../utils/descriptionLayout';
import { resolveFileId } from '../placeholders';

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

  // fileId is needed as a standalone value (returned below for callers
  // outside the description text — the AI-prompt generator, the copy
  // footer), independent of whether Broadcast Block itself is displayed.
  const fileId = resolveFileId(ctx);

  // --- Song overrides (needed by intro, story, and dynamic hook blocks) ---
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

  // --- Long description ---
  if (!projectConfig?.description.templates?.long?.layout) {
    throw new Error('Missing description layout in project config');
  }

  // --- Custom blocks ---
  const { renderedCustomBlocks, supportBlock } =
    generateCustomBlocks(formData, projectConfig, tagLine);

  const layout = projectConfig.description.templates.long.layout;
  // broadcastBlock/logBlock are deliberately absent here — both are real
  // Block Groups now (see projects.json), each combining a wrapper Hook
  // Block with a trivial single-template Hook Block wrapping a Custom
  // Placeholder ({custom.tagStatusLine}/{custom.tagLogLine}). They're
  // produced entirely by generateBlockGroups below, same as closingBlock.
  const baseBlocks = {
    introBlock,
    storyBlock,
    technicalBlock,
    supportBlock,
    ...renderedCustomBlocks,
  };
  // Block Groups (e.g. closingBlock = closingSignal + philosophyLine) resolve
  // their children through the same resolveLayoutKey the top-level layout
  // loop below uses, then get merged in as ordinary blocks — a group key
  // becomes just another `blockName in blocks` hit, no special-casing needed
  // in the loop itself. logBlock's wrapper references {tagLine}, which must
  // resolve via buildTagLine's result (the raw `tagLine` var), not
  // buildTagPhrase's (this ctx's own tagLine field) — a genuinely different
  // value — so it gets its own ctx via groupCtxOverrides rather than the
  // shared one every other group uses.
  const blockGroups = projectConfig.description?.blockGroups || [];
  const logCtx = { ...ctx, tagLine };
  const blocks = {
    ...baseBlocks,
    ...generateBlockGroups(blockGroups, ctx, baseBlocks, songOverrides, { logBlock: logCtx }),
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
      const overridden = isSongOverrideActive(songOverrides, blockName);
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
