import { useState } from 'react';
import BlockInfoCard from '../../ui/BlockInfoCard';
import LabelSliderRow from '../../ui/LabelSliderRow';
import SubTabNav from '../../ui/SubTabNav';
import MoveControls from '../../ui/MoveControls';
import IconButton from '../../ui/IconButton';
import { isListBlock, isTextBlock, BLOCK_TYPE_SUBTABS } from '../../../utils/customBlocks';
import { buildHookBlockMaps, makeLayoutLabelResolver, resolveBlockSource, KNOWN_SHORTS_BLOCK_META } from '../../../utils/descriptionLayout';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

export default function ShortsDescriptionSettings({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  onNavigateToBlock,
  onNavigateToShortHooks,
}) {
  const [mobileTab, setMobileTab] = useState('layout');

  const shortsConfig    = projectConfig.description?.templates?.shorts || {};
  const overriddenShorts =
    projectSettingsOverrides.description?.templates?.shorts || {};
  const overriddenDesc = projectSettingsOverrides.description || {};
  const customBlocks =
    projectConfig.description?.templates?.long?.customBlocks || {};

  const hookBlocks = projectConfig.description?.hookBlocks || [];

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
  });

  const count = overriddenShorts.count ?? shortsConfig.count ?? 3;

  const defaultLayout =
    baseProjectConfig?.description?.templates?.shorts?.layout ??
    shortsConfig.layout ?? ['coverLine', 'hook', 'secondary'];

  const activeKeys = overriddenShorts.layout ?? defaultLayout;

  const dynamicBlockKeys = Object.keys(customBlocks).filter((key) => {
    if (defaultLayout.includes(key)) return false;
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
    .filter((k) => !defaultLayout.includes(k));

  const availableKeys = [
    ...defaultLayout,
    ...dynamicBlockKeys,
    ...hookBlockAvailableKeys,
  ].filter((k) => !activeKeys.includes(k));

  function layoutIndex(key) {
    const idx = defaultLayout.indexOf(key);
    return idx === -1 ? Infinity : idx;
  }

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

  function getNavigateHandler(key) {
    if (key === 'hook' && onNavigateToShortHooks) {
      return () => onNavigateToShortHooks({});
    }
    if (!onNavigateToBlock) return undefined;
    const source = resolveBlockSource(key, {
      hookBlockMaps: { allLayoutKeys: allHookBlockLayoutKeys, layoutKeyToBlockKey },
      customBlocks,
      supportBlockConfig: undefined,
    });
    if (!source) return undefined;
    const subTab = BLOCK_TYPE_SUBTABS[source.blockType]?.subTab;
    return () => onNavigateToBlock({ subTab, blockKey: source.blockKey });
  }

  function renderAvailableBlock(key) {
    return (
      <BlockInfoCard
        key={key}
        label={getLayoutBlockLabel(key)}
        onAdd={() => addToLayout(key)}
        onNavigate={getNavigateHandler(key)}
      />
    );
  }

  function renderActiveBlock(key, index) {
    const isFirst = index === 0;
    const isLast  = index === activeKeys.length - 1;

    return (
      <div key={key} className="desc-block-wrapper">
        <MoveControls
          className="desc-block-move-controls"
          disabledUp={isFirst}
          disabledDown={isLast}
          onMoveUp={() => moveBlock(key, -1)}
          onMoveDown={() => moveBlock(key, 1)}
        />
        <BlockInfoCard
          label={getLayoutBlockLabel(key)}
          onRemove={() => removeFromLayout(key)}
          onNavigate={getNavigateHandler(key)}
        />
      </div>
    );
  }

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
