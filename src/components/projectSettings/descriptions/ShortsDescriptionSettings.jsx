import { useState } from 'react';
import BlockInfoCard from '../../ui/BlockInfoCard';
import LabelSliderRow from '../../ui/LabelSliderRow';
import SubTabNav from '../../ui/SubTabNav';
import MoveControls from '../../ui/MoveControls';
import IconButton from '../../ui/IconButton';
import { isListBlock, isTextBlock, getBlockLabel } from '../../../utils/customBlocks';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

const KNOWN_SHORTS_BLOCK_META = {
  coverLine: { label: 'Cover Line' },
  header:    { label: 'Header' },
  primary:   { label: 'Primary' },
  secondary: { label: 'Secondary' },
  hook:      { label: 'Hook' },
};

export default function ShortsDescriptionSettings({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  onNavigateToBlock,
}) {
  const [mobileTab, setMobileTab] = useState('layout');

  const shortsConfig    = projectConfig.description?.templates?.shorts || {};
  const overriddenShorts =
    projectSettingsOverrides.description?.templates?.shorts || {};
  const overriddenDesc = projectSettingsOverrides.description || {};
  const customBlocks =
    projectConfig.description?.templates?.long?.customBlocks || {};

  const hookBlocks = projectConfig.description?.hookBlocks || [];

  // All hook block layout keys (for subtitle detection in the active layout)
  const allHookBlockLayoutKeys = new Set(
    hookBlocks.map((b) => b.descriptionLayoutKey ?? b.key),
  );

  // Label map derived from hookBlocks config
  const hookBlockLabelMap = Object.fromEntries(
    hookBlocks.map((b) => [b.descriptionLayoutKey ?? b.key, b.label]),
  );

  // Maps description layout key → actual hook block key (for navigation).
  const layoutKeyToBlockKey = Object.fromEntries(
    hookBlocks.map((b) => [b.descriptionLayoutKey ?? b.key, b.key]),
  );

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

  function renderActiveBlock(key, index) {
    const label =
      hookBlockLabelMap[key] ??
      KNOWN_SHORTS_BLOCK_META[key]?.label ??
      getBlockLabel(key, customBlocks[key]);
    const isFirst = index === 0;
    const isLast  = index === activeKeys.length - 1;

    let onNavigate;
    if (onNavigateToBlock) {
      if (allHookBlockLayoutKeys.has(key)) {
        onNavigate = () => onNavigateToBlock({ subTab: 'hooks', blockKey: layoutKeyToBlockKey[key] });
      } else if (isListBlock(customBlocks[key])) {
        onNavigate = () => onNavigateToBlock({ subTab: 'lists', blockKey: key });
      } else if (isTextBlock(customBlocks[key])) {
        onNavigate = () => onNavigateToBlock({ subTab: 'text', blockKey: key });
      }
    }

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
          label={label}
          onRemove={() => removeFromLayout(key)}
          onNavigate={onNavigate}
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

      <div className="desc-layout" data-mobile-tab={mobileTab}>
        <aside className="desc-layout-available">
          <h3>Available</h3>
          {availableKeys.length === 0 ? (
            <p className="tag-summary">All blocks are in the layout.</p>
          ) : (
            <ul className="desc-available-list">
              {availableKeys.map((key) => {
                const itemLabel =
                  hookBlockLabelMap[key] ??
                  KNOWN_SHORTS_BLOCK_META[key]?.label ??
                  getBlockLabel(key, customBlocks[key]);
                return (
                  <li key={key} className="desc-available-item">
                    <span>{itemLabel}</span>
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
