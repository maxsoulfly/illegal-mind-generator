import { useState } from 'react';
import BlockInfoCard from '../../ui/BlockInfoCard';
import SubTabNav from '../../ui/SubTabNav';
import MoveControls from '../../ui/MoveControls';
import IconButton from '../../ui/IconButton';
import { isListBlock, isTextBlock } from '../../../utils/customBlocks';
import { buildHookBlockMaps, makeLayoutLabelResolver } from '../../../utils/descriptionLayout';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

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
  const [mobileTab, setMobileTab] = useState('layout');

  const longTemplates = projectConfig.description?.templates?.long || {};
  const customBlocks  = longTemplates.customBlocks || {};
  const overriddenDesc = projectSettingsOverrides.description || {};
  const hookBlocks = projectConfig.description?.hookBlocks || [];

  const { allLayoutKeys: allHookBlockLayoutKeys, labelMap, layoutKeyToBlockKey } = buildHookBlockMaps(hookBlocks);
  const hookBlockLabelOverrides = overriddenDesc.hookBlockLabelOverrides || {};
  const blockLabelOverrides     = overriddenDesc.blockLabelOverrides     || {};
  const getLayoutBlockLabel = makeLayoutLabelResolver({
    labelMap,
    layoutKeyToBlockKey,
    hookBlockLabelOverrides,
    blockLabelOverrides,
    knownMeta: KNOWN_BLOCK_META,
    customBlocks,
  });

  const defaultLayout =
    baseProjectConfig?.description?.templates?.long?.layout ?? longTemplates.layout ?? [];
  const activeKeys =
    projectSettingsOverrides.description?.templates?.long?.layout ?? defaultLayout;

  const dynamicBlockKeys = Object.keys(customBlocks).filter((key) => {
    if (defaultLayout.includes(key)) return false;
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
    .filter((k) => !defaultLayout.includes(k));

  const availableKeys = [
    ...defaultLayout,
    ...dynamicBlockKeys,
    ...hookBlockAvailableKeys,
  ].filter((k) => !activeKeys.includes(k));

  // Infinity so dynamic/user-created blocks (not in defaultLayout) sort to the end on Reset Order.
  function layoutIndex(key) {
    const idx = defaultLayout.indexOf(key);
    return idx === -1 ? Infinity : idx;
  }

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

  function addToLayout(key) {
    if (!defaultLayout.includes(key)) {
      updateLayout([...activeKeys, key]);
      return;
    }
    const targetIndex = defaultLayout.indexOf(key);
    const next = [...activeKeys];
    // Insert after the last active block whose defaultLayout position is before this one,
    // so re-adding a block preserves the original ordering rather than always appending.
    const insertAt = next.findLastIndex((k) => layoutIndex(k) < targetIndex) + 1;
    next.splice(insertAt, 0, key);
    updateLayout(next);
  }

  function removeFromLayout(key) {
    updateLayout(activeKeys.filter((k) => k !== key));
  }

  function moveBlock(key, direction) {
    const idx = activeKeys.indexOf(key);
    const next = [...activeKeys];
    next.splice(idx, 1);
    next.splice(idx + direction, 0, key);
    updateLayout(next);
  }

  function resetOrder() {
    const sorted = [...activeKeys].sort((a, b) => layoutIndex(a) - layoutIndex(b));
    updateLayout(sorted);
  }

  function getNavigateHandler(blockKey) {
    if (!onNavigateToBlock) return undefined;
    // supportBlock lives directly on longTemplates, not inside customBlocks.
    const blockData =
      blockKey === 'supportBlock' ? longTemplates.supportBlock : customBlocks[blockKey];
    if (allHookBlockLayoutKeys.has(blockKey)) {
      return () => onNavigateToBlock({ subTab: 'hooks', blockKey: layoutKeyToBlockKey[blockKey] });
    } else if (isListBlock(blockData)) {
      return () => onNavigateToBlock({ subTab: 'lists', blockKey });
    } else if (isTextBlock(blockData)) {
      return () => onNavigateToBlock({ subTab: 'text', blockKey });
    }
    return undefined;
  }

  function renderAvailableBlock(blockKey) {
    return (
      <BlockInfoCard
        key={blockKey}
        label={getLayoutBlockLabel(blockKey)}
        onAdd={() => addToLayout(blockKey)}
        onNavigate={getNavigateHandler(blockKey)}
      />
    );
  }

  function renderActiveBlock(blockKey, index) {
    const isFirst = index === 0;
    const isLast  = index === activeKeys.length - 1;

    return (
      <div key={blockKey} className="desc-block-wrapper">
        <MoveControls
          className="desc-block-move-controls"
          disabledUp={isFirst}
          disabledDown={isLast}
          onMoveUp={() => moveBlock(blockKey, -1)}
          onMoveDown={() => moveBlock(blockKey, 1)}
        />
        <BlockInfoCard
          label={getLayoutBlockLabel(blockKey)}
          onRemove={() => removeFromLayout(blockKey)}
          onNavigate={getNavigateHandler(blockKey)}
        />
      </div>
    );
  }

  return (
    <>
      <SubTabNav
        tabs={MOBILE_COLUMN_TABS}
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        className="desc-mobile-tabs"
      />

      <div className="desc-layout-header">
        <span className="desc-col-label">Available</span>
        <div className="desc-active-header">
          <span>Active Layout</span>
          <IconButton
            icon="↺ Reset Order"
            title="Reset to default order"
            onClick={resetOrder}
          />
        </div>
      </div>

      <div className="desc-layout" data-mobile-tab={mobileTab}>
        <aside className="desc-layout-available">
          {availableKeys.length === 0 ? (
            <p className="tag-summary">All blocks are in the layout.</p>
          ) : (
            <div className="desc-available-list">
              {availableKeys.map((key) => renderAvailableBlock(key))}
            </div>
          )}
        </aside>

        <div className="desc-layout-active">
          {activeKeys.map((key, i) => renderActiveBlock(key, i))}
        </div>
      </div>
    </>
  );
}
