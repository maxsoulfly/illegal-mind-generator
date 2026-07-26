import { generateShortDescriptions } from './generateShortDescriptions';
import { pickTechnicalBlock, renderTechnicalBlock } from './generateTechnicalBlock';
import {
  pickCustomBlocks, renderCustomBlocks,
  pickLayoutHookBlocks, renderLayoutKey, renderBlockGroups,
  getEffectiveSongOverrides, renderTextTemplate, resolveHookOverride,
  pickViableTemplateFrozen, renderViableTemplateFrozen,
  isSongOverrideActive,
} from './generateCustomBlocks';
import { buildTagLine, buildTagPhrase } from './descriptionTagHelpers';
import { buildHookBlockMaps, buildBlockGroupMaps, resolveBlockSource } from '../../utils/descriptionLayout';
import { resolveFileId } from '../placeholders';

// PICK phase: freezes every random selection across the Long description —
// which Intro/Story template won, the Technical block's two pools, every
// custom block's own default pick, every "pure hook block" layout slot (the
// top-level layout array plus every Block Group child), and the one random
// buildTagLine() result the Log Block's wrapper needs. Song overrides are
// deliberately NOT resolved here — they're checked live at render time (see
// renderDescriptions), which is what lets editing/clearing one reflect
// immediately without a re-pick. Frozen except via Transformation Tags /
// Regenerate / entry load-clear (see useGeneratedOutput.js's narrow-deps
// "pick" memo).
export function pickDescriptions(formData, projectConfig) {
  const selectedTags = formData.transformationTags || [];
  const tagPhrase = buildTagPhrase(formData, projectConfig);
  const ctx = {
    formData,
    projectConfig,
    tagLine: tagPhrase,
    overrides: { num: formData.signalNumber || '00' },
  };

  // buildTagLine has its own randomness (shuffles selected tags, random
  // fallback/template pick) — frozen once here; buildTagPhrase (tagPhrase
  // above) is deterministic given already-frozen tags, so it's safe to
  // recompute fresh at render time instead.
  const frozenTagLine = buildTagLine(formData, projectConfig);

  const pickedIntro = pickViableTemplateFrozen(projectConfig?.description.templates?.long?.introHook || [], ctx);
  const pickedStory = pickViableTemplateFrozen(projectConfig?.description.templates?.long?.storyBlock || [], ctx);
  const pickedTechnical = pickTechnicalBlock(selectedTags, projectConfig, ctx);
  const pickedCustom = pickCustomBlocks(formData, projectConfig, ctx);

  if (!projectConfig?.description.templates?.long?.layout) {
    throw new Error('Missing description layout in project config');
  }
  const layout = projectConfig.description.templates.long.layout;
  const blockGroups = projectConfig.description?.blockGroups || [];

  // Every key that might be a "pure hook block" layout slot needs its pool
  // pick frozen up front — the top-level layout array plus every Block Group
  // child key. Keys that turn out to already be covered by pickedIntro/
  // pickedStory/pickedTechnical/pickedCustom/group outputs are simply never
  // looked up at render time; computing (and discarding) a pick for them too
  // is harmless.
  const allLayoutKeys = [
    ...layout,
    ...blockGroups.flatMap((group) => group.children.filter((c) => c.type === 'block').map((c) => c.key)),
  ];
  const pickedHookBlocks = pickLayoutHookBlocks(allLayoutKeys, ctx);

  return { frozenTagLine, pickedIntro, pickedStory, pickedTechnical, pickedCustom, pickedHookBlocks, layout, blockGroups };
}

// RENDER phase: pure placeholder substitution against live formData/config —
// song overrides are checked fresh on every call (not frozen), which is what
// makes typing/clearing a Story/Log/CTA/custom-block override, or editing
// Artist/Song/Signal Number/Genre, show up immediately without re-picking
// anything.
export function renderDescriptions(picked, formData, projectConfig) {
  const tagPhrase = buildTagPhrase(formData, projectConfig);
  const ctx = {
    formData,
    projectConfig,
    tagLine: tagPhrase,
    overrides: { num: formData.signalNumber || '00' },
  };

  const fileId = resolveFileId(ctx);
  const songOverrides = getEffectiveSongOverrides(formData);

  const introOverride = resolveHookOverride(songOverrides.introBlock);
  const introBlock = introOverride
    ? renderTextTemplate(introOverride, projectConfig, formData, tagPhrase)
    : renderViableTemplateFrozen(picked.pickedIntro, ctx)?.text ?? '';

  const storyOverride = resolveHookOverride(songOverrides.storyBlock);
  const storyBlock = storyOverride
    ? renderTextTemplate(storyOverride, projectConfig, formData, tagPhrase)
    : renderViableTemplateFrozen(picked.pickedStory, ctx)?.text ?? '';

  const technicalBlock = renderTechnicalBlock(picked.pickedTechnical, ctx);

  const { renderedCustomBlocks, supportBlock } = renderCustomBlocks(picked.pickedCustom, ctx, songOverrides);

  // broadcastBlock/logBlock are deliberately absent here — both are real
  // Block Groups (see projects.json), each combining a wrapper Hook Block
  // with a trivial single-template Hook Block wrapping a Custom Placeholder
  // ({custom.tagStatusLine}/{custom.tagLogLine}). They're produced entirely
  // by renderBlockGroups below, same as closingBlock.
  const baseBlocks = {
    introBlock,
    storyBlock,
    technicalBlock,
    supportBlock,
    ...renderedCustomBlocks,
  };

  // Log Notes' wrapper references {tagLine}, which must resolve via
  // buildTagLine's (randomized, frozen) result, not buildTagPhrase's (this
  // ctx's own tagLine field) — a genuinely different value.
  const logCtx = { ...ctx, tagLine: picked.frozenTagLine };
  const blocks = {
    ...baseBlocks,
    ...renderBlockGroups(picked.blockGroups, ctx, baseBlocks, songOverrides, picked.pickedHookBlocks, { logBlock: logCtx }),
  };

  // Source attribution for click-to-navigate + hover tooltips (DescriptionsPanel).
  // Block-level granularity — matches what LongDescriptionSettings.jsx's nav
  // arrows already point at, not per-line within a merged block like broadcastBlock.
  const customBlocksConfig = projectConfig.description?.templates?.long?.customBlocks || {};
  const hookBlockMaps = buildHookBlockMaps(projectConfig.description?.hookBlocks || []);
  const blockGroupMaps = buildBlockGroupMaps(picked.blockGroups);
  const supportBlockConfig = projectConfig.description?.templates?.long?.supportBlock;

  const longDescriptionSegments = picked.layout
    .map((blockName) => {
      const text = renderLayoutKey(blockName, ctx, blocks, songOverrides, picked.pickedHookBlocks);
      if (!text) return null;
      const overridden = isSongOverrideActive(songOverrides, blockName);
      const source = resolveBlockSource(blockName, { hookBlockMaps, customBlocks: customBlocksConfig, supportBlockConfig, blockGroupMaps, overridden });
      return { text, source };
    })
    .filter(Boolean);

  const longDescription = longDescriptionSegments.map((segment) => segment.text).join('\n\n');

  return {
    longDescription,
    longDescriptionSegments,
    fileId,
  };
}

// Back-compat convenience: pick + render the Long description, plus Shorts
// (which has its own independent pick/render split — see
// generateShortDescriptions.js) — matching the previous combined return
// shape exactly.
export function generateDescriptions(formData, projectConfig) {
  const long = renderDescriptions(pickDescriptions(formData, projectConfig), formData, projectConfig);
  const { shortDescriptions, shortDescriptionSegments } = generateShortDescriptions(formData, projectConfig);

  return { ...long, shortDescriptions, shortDescriptionSegments };
}
