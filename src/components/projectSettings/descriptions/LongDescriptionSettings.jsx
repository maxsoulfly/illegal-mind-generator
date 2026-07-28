import DescriptionLayoutBoard from './DescriptionLayoutBoard';
import useDescriptionLayoutActions from './useDescriptionLayoutActions';
import { isListBlock, isTextBlock } from '../../../utils/customBlocks';
import { buildHookBlockMaps, buildBlockGroupMaps, makeLayoutLabelResolver, makeNavigateHandler } from '../../../utils/descriptionLayout';

const KNOWN_BLOCK_META = {
  broadcastBlock:    { label: 'Broadcast Block' },
  introBlock:        { label: 'Intro Hook' },
  storyBlock:        { label: 'Story Block' },
  technicalBlock:    { label: 'Technical Block' },
  logBlock:          { label: 'Log Block' },
  closingBlock:      { label: 'Closing Block' },
  supportBlock:      { label: 'Support Block' },
  customCtaBlock:    { label: 'Custom CTA' },
  mixingCtaBlock:    { label: 'Mixing CTA' },
  gearBlock:         { label: 'Gear Used' },
  playlistBlock:     { label: 'Playlist' },
  renovationBlock:   { label: 'Renovation Block' },
};

export default function LongDescriptionSettings({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  onNavigateToBlock,
}) {
  const longTemplates = projectConfig.description?.templates?.long || {};
  const customBlocks  = longTemplates.customBlocks || {};
  const overriddenDesc = projectSettingsOverrides.description || {};
  const hookBlocks = projectConfig.description?.hookBlocks || [];

  const { allLayoutKeys: allHookBlockLayoutKeys, labelMap, layoutKeyToBlockKey } = buildHookBlockMaps(hookBlocks);
  const blockGroups = projectConfig.description?.blockGroups || [];
  const blockGroupMaps = buildBlockGroupMaps(blockGroups);
  const hookBlockLabelOverrides = overriddenDesc.hookBlockLabelOverrides || {};
  const blockLabelOverrides     = overriddenDesc.blockLabelOverrides     || {};
  const getLayoutBlockLabel = makeLayoutLabelResolver({
    labelMap,
    layoutKeyToBlockKey,
    hookBlockLabelOverrides,
    blockLabelOverrides,
    knownMeta: KNOWN_BLOCK_META,
    customBlocks,
    blockGroupLabelMap: blockGroupMaps.labelMap,
  });
  const getNavigateHandler = makeNavigateHandler({
    hookBlockMaps: { allLayoutKeys: allHookBlockLayoutKeys, layoutKeyToBlockKey },
    customBlocks,
    supportBlockConfig: longTemplates.supportBlock,
    blockGroupMaps,
    onNavigateToBlock,
  });

  const defaultLayout =
    baseProjectConfig?.description?.templates?.long?.layout ?? longTemplates.layout ?? [];
  const activeKeys =
    projectSettingsOverrides.description?.templates?.long?.layout ?? defaultLayout;

  // A block assigned to a Group is exclusive to it — no longer independently
  // placeable at the top level (still fully editable wherever it normally
  // lives, e.g. the Hook Blocks tab).
  const groupChildKeys = new Set(
    blockGroups.flatMap((g) => g.children.filter((c) => c.type === 'block').map((c) => c.key)),
  );

  const dynamicBlockKeys = Object.keys(customBlocks).filter((key) => {
    if (defaultLayout.includes(key)) return false;
    if (groupChildKeys.has(key)) return false;
    if (!isListBlock(customBlocks[key]) && !isTextBlock(customBlocks[key])) return false;
    const blockData = customBlocks[key];
    const target = (typeof blockData === 'object' && blockData?.target) || 'long';
    return target === 'long' || target === 'both';
  });

  // Hook blocks eligible for Long (target = 'long' or 'both') not already in defaultLayout
  const hookBlockAvailableKeys = hookBlocks
    .filter((b) => {
      const target =
        overriddenDesc.hookBlockTargets?.[b.key] ??
        (b.path === 'shorts' ? 'shorts' : 'long');
      return target === 'long' || target === 'both';
    })
    .map((b) => b.descriptionLayoutKey ?? b.key)
    .filter((k) => !defaultLayout.includes(k) && !groupChildKeys.has(k));

  // Groups eligible for Long, not already in defaultLayout (user-created ones
  // — a JSON-default group like closingBlock is already part of defaultLayout).
  const groupKeys = blockGroups
    .filter((g) => !defaultLayout.includes(g.key) && (g.target === 'long' || g.target === 'both'))
    .map((g) => g.key);

  const availableKeys = [
    ...defaultLayout,
    ...dynamicBlockKeys,
    ...hookBlockAvailableKeys,
    ...groupKeys,
  ].filter((k) => !activeKeys.includes(k));

  function updateLayout(newKeys) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          long: {
            ...(projectSettingsOverrides.description?.templates?.long || {}),
            layout: newKeys,
          },
        },
      },
    });
  }

  const { sensors, addToLayout, removeFromLayout, moveBlock, handleDragEnd, resetOrder } =
    useDescriptionLayoutActions({ activeKeys, defaultLayout, updateLayout });

  return (
    <DescriptionLayoutBoard
      availableKeys={availableKeys}
      activeKeys={activeKeys}
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onResetOrder={resetOrder}
      getLayoutBlockLabel={getLayoutBlockLabel}
      getNavigateHandler={getNavigateHandler}
      addToLayout={addToLayout}
      removeFromLayout={removeFromLayout}
      moveBlock={moveBlock}
    />
  );
}
