import { useState } from 'react';
import BlockInfoCard from '../../ui/BlockInfoCard';
import SubTabNav from '../../ui/SubTabNav';
import MoveControls from '../../ui/MoveControls';
import IconButton from '../../ui/IconButton';
import { isListBlock, isTextBlock, getBlockLabel } from '../../../utils/customBlocks';

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
  coverSummaryBlock: { label: 'Cover Summary' },
};

export default function LongDescriptionSettings({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const [mobileTab, setMobileTab] = useState('layout');

  const longTemplates = projectConfig.description?.templates?.long || {};
  const customBlocks  = longTemplates.customBlocks || {};

  // Derive hook-block-backed layout keys from config — no hardcoding
  const hookBlockLayoutKeys = new Set(
    (projectConfig.description?.hookBlocks || [])
      .filter((b) => b.path !== 'shorts')
      .map((b) => b.descriptionLayoutKey ?? b.key),
  );

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

  const availableKeys = [...defaultLayout, ...dynamicBlockKeys].filter(
    (k) => !activeKeys.includes(k),
  );

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

  function renderActiveBlock(blockKey, index) {
    const meta =
      KNOWN_BLOCK_META[blockKey] ||
      { label: getBlockLabel(blockKey, customBlocks[blockKey]) };
    const isFirst = index === 0;
    const isLast  = index === activeKeys.length - 1;

    const blockData =
      blockKey === 'supportBlock' ? longTemplates.supportBlock : customBlocks[blockKey];
    const isListShaped = isListBlock(blockData);
    const isTextShaped = isTextBlock(blockData);

    let subtitle;
    if (hookBlockLayoutKeys.has(blockKey)) {
      subtitle = 'Edit in Project Settings → Blocks → Hook Blocks.';
    } else if (isListShaped) {
      subtitle = 'Edit content in Project Settings → Blocks → Lists.';
    } else if (isTextShaped) {
      subtitle = 'Edit content in Project Settings → Blocks → Text Blocks.';
    }

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
          label={meta.label}
          onRemove={() => removeFromLayout(blockKey)}
          collapsible={!!subtitle}
        >
          {subtitle && <p className="tag-summary">{subtitle}</p>}
        </BlockInfoCard>
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

      <div className="desc-layout" data-mobile-tab={mobileTab}>
        <aside className="desc-layout-available">
          <h3>Available</h3>
          {availableKeys.length === 0 ? (
            <p className="tag-summary">All blocks are in the layout.</p>
          ) : (
            <ul className="desc-available-list">
              {availableKeys.map((key) => {
                const meta =
                  KNOWN_BLOCK_META[key] ||
                  { label: getBlockLabel(key, customBlocks[key]) };
                return (
                  <li key={key} className="desc-available-item">
                    <span>{meta.label}</span>
                    <IconButton
                      icon="+"
                      title="Add to layout"
                      onClick={() => addToLayout(key)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="desc-layout-active">
          <div className="desc-active-header">
            <span>Active Layout</span>
            <IconButton
              icon="↺ Reset Order"
              title="Reset to default order"
              onClick={resetOrder}
            />
          </div>
          {activeKeys.map((key, i) => renderActiveBlock(key, i))}
        </div>
      </div>
    </>
  );
}
