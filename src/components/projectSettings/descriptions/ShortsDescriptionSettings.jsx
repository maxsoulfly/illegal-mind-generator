import DescriptionLayoutBoard from './DescriptionLayoutBoard';
import useDescriptionLayoutActions from './useDescriptionLayoutActions';
import LabelSliderRow from '../../ui/LabelSliderRow';
import { isListBlock, isTextBlock } from '../../../utils/customBlocks';
import { buildHookBlockMaps, buildBlockGroupMaps, makeLayoutLabelResolver, makeNavigateHandler, KNOWN_SHORTS_BLOCK_META } from '../../../utils/descriptionLayout';

export default function ShortsDescriptionSettings({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  onNavigateToBlock,
}) {
  const shortsConfig    = projectConfig.description?.templates?.shorts || {};
  const overriddenShorts =
    projectSettingsOverrides.description?.templates?.shorts || {};
  const overriddenDesc = projectSettingsOverrides.description || {};
  const customBlocks =
    projectConfig.description?.templates?.long?.customBlocks || {};

  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const blockGroups = projectConfig.description?.blockGroups || [];
  const blockGroupMaps = buildBlockGroupMaps(blockGroups);

  const { allLayoutKeys: allHookBlockLayoutKeys, labelMap, layoutKeyToBlockKey } = buildHookBlockMaps(hookBlocks);
  const hookBlockLabelOverrides = overriddenDesc.hookBlockLabelOverrides || {};
  const blockLabelOverrides     = overriddenDesc.blockLabelOverrides     || {};
  const getLayoutBlockLabel = makeLayoutLabelResolver({
    labelMap,
    layoutKeyToBlockKey,
    hookBlockLabelOverrides,
    blockLabelOverrides,
    knownMeta: KNOWN_SHORTS_BLOCK_META,
    customBlocks,
    blockGroupLabelMap: blockGroupMaps.labelMap,
  });
  const getNavigateHandler = makeNavigateHandler({
    hookBlockMaps: { allLayoutKeys: allHookBlockLayoutKeys, layoutKeyToBlockKey },
    customBlocks,
    supportBlockConfig: undefined,
    blockGroupMaps,
    onNavigateToBlock,
  });

  const count = overriddenShorts.count ?? shortsConfig.count ?? 3;

  const defaultLayout =
    baseProjectConfig?.description?.templates?.shorts?.layout ??
    shortsConfig.layout ?? ['coverLine', 'hook', 'secondary'];

  const activeKeys = overriddenShorts.layout ?? defaultLayout;

  // A block assigned to a Group is exclusive to it — no longer independently
  // placeable at the top level. No group currently targets Shorts, but this
  // keeps the two Description settings pages from drifting apart.
  const groupChildKeys = new Set(
    blockGroups.flatMap((g) => g.children.filter((c) => c.type === 'block').map((c) => c.key)),
  );

  const dynamicBlockKeys = Object.keys(customBlocks).filter((key) => {
    if (defaultLayout.includes(key)) return false;
    if (groupChildKeys.has(key)) return false;
    if (!isListBlock(customBlocks[key]) && !isTextBlock(customBlocks[key])) return false;
    const blockData = customBlocks[key];
    const target = (typeof blockData === 'object' && blockData?.target) || 'long';
    return target === 'shorts' || target === 'both';
  });

  // Hook blocks eligible for Shorts (target = 'shorts' or 'both') that aren't
  // already in defaultLayout (those are managed via the layout array already)
  const hookBlockAvailableKeys = hookBlocks
    .filter((b) => {
      const target =
        overriddenDesc.hookBlockTargets?.[b.key] ??
        (b.path === 'shorts' ? 'shorts' : 'long');
      return target === 'shorts' || target === 'both';
    })
    .map((b) => b.descriptionLayoutKey ?? b.key)
    .filter((k) => !defaultLayout.includes(k) && !groupChildKeys.has(k));

  // Groups eligible for Shorts, not already in defaultLayout.
  const groupKeys = blockGroups
    .filter((g) => !defaultLayout.includes(g.key) && (g.target === 'shorts' || g.target === 'both'))
    .map((g) => g.key);

  const availableKeys = [
    ...defaultLayout,
    ...dynamicBlockKeys,
    ...hookBlockAvailableKeys,
    ...groupKeys,
  ].filter((k) => !activeKeys.includes(k));

  function updateShortsField(field, value) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          shorts: { ...overriddenShorts, [field]: value },
        },
      },
    });
  }

  function updateLayout(newKeys) {
    updateShortsField('layout', newKeys);
  }

  const { sensors, addToLayout, removeFromLayout, moveBlock, handleDragEnd, resetOrder } =
    useDescriptionLayoutActions({ activeKeys, defaultLayout, updateLayout });

  return (
    <>
      <div className="desc-generation-settings">
        <LabelSliderRow
          label="Descriptions to generate"
          value={count}
          min={3}
          max={10}
          onChange={(val) => updateShortsField('count', val)}
        />
      </div>

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
    </>
  );
}
