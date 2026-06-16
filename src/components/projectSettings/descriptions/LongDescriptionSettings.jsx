import { useState } from 'react';
import TemplateGroupCard from '../../ui/TemplateGroupCard';
import BlockInfoCard from '../../ui/BlockInfoCard';
import SubTabNav from '../../ui/SubTabNav';
import MoveControls from '../../ui/MoveControls';
import IconButton from '../../ui/IconButton';

function CollapsibleBlockGroup({ label, onRemove, children }) {
  const [collapsed, setCollapsed] = useState(true);

  if (collapsed) {
    return (
      <article className="tag-card tag-card--collapsed">
        <header className="tag-card-header">
          <h3 className="tag-card-toggle" onClick={() => setCollapsed(false)}>
            <span className="tag-card-collapse-icon">▶</span>
            {label}
          </h3>
          <IconButton icon="×" title="Remove from layout" onClick={onRemove} />
        </header>
      </article>
    );
  }

  return (
    <div className="desc-block-group">
      <div className="desc-block-group-header">
        <span className="desc-block-group-toggle" onClick={() => setCollapsed(true)}>
          <span className="tag-card-collapse-icon">▼</span>
          {label}
        </span>
        <IconButton icon="×" title="Remove from layout" onClick={onRemove} />
      </div>
      {children}
    </div>
  );
}

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

// Maps layout block names (engine keys) to display metadata
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

// Maps layout block keys to the template config sub-groups they expose for editing
const TEMPLATE_GROUPS = {
  broadcastBlock: [
    { key: 'broadcastHeader', label: 'Broadcast Header' },
    { key: 'operatorStatuses', label: 'Operator Statuses', path: 'top' },
    { key: 'statusLines', label: 'Status Lines' },
  ],
  technicalBlock: [{ key: 'technicalLines', label: 'Technical Lines' }],
  introBlock:  [{ key: 'introHook',     label: 'Intro Hook' }],
  storyBlock:  [{ key: 'storyBlock',    label: 'Story Block' }],
  logBlock: [
    { key: 'logNotes',          label: 'Log Notes' },
    { key: 'tagLineFallbacks',  label: 'Tag Line Fallbacks' },
    { key: 'tagLineTemplates',  label: 'Tag Line Templates' },
  ],
  closingBlock: [
    { key: 'closingSignal',  label: 'Closing Signal' },
    { key: 'philosophyLine', label: 'Philosophy Line' },
  ],
};

export default function LongDescriptionSettings({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const [mobileTab, setMobileTab] = useState('layout');

  const longTemplates = projectConfig.description?.templates?.long || {};

  // Use base (pre-override) layout so Available always reflects the original config
  const defaultLayout =
    baseProjectConfig?.description?.templates?.long?.layout ?? longTemplates.layout ?? [];
  const activeKeys =
    projectSettingsOverrides.description?.templates?.long?.layout ?? defaultLayout;

  // Available = blocks in the project's default layout that have been removed
  const availableKeys = defaultLayout.filter((k) => !activeKeys.includes(k));

  function getTemplates(key, path) {
    if (path === 'top') return projectConfig.description?.[key] || [];
    return longTemplates[key] || [];
  }

  function updateTemplates(key, path, newTemplates) {
    if (path === 'top') {
      updateProjectOverride({
        description: {
          ...(projectSettingsOverrides.description || {}),
          [key]: newTemplates,
        },
      });
    } else {
      updateProjectOverride({
        description: {
          ...(projectSettingsOverrides.description || {}),
          templates: {
            ...(projectSettingsOverrides.description?.templates || {}),
            long: {
              ...(projectSettingsOverrides.description?.templates?.long || {}),
              [key]: newTemplates,
            },
          },
        },
      });
    }
  }

  function resetGroup(key, path) {
    if (path === 'top') {
      const { [key]: _removed, ...remaining } =
        projectSettingsOverrides.description || {};
      updateProjectOverride({ description: remaining });
    } else {
      const { [key]: _removed, ...remaining } =
        projectSettingsOverrides.description?.templates?.long || {};
      updateProjectOverride({
        description: {
          ...(projectSettingsOverrides.description || {}),
          templates: {
            ...(projectSettingsOverrides.description?.templates || {}),
            long: remaining,
          },
        },
      });
    }
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
    // Re-insert at its original position in the default layout
    const targetIndex = defaultLayout.indexOf(key);
    const next = [...activeKeys];
    const insertAt = next.findLastIndex((k) => defaultLayout.indexOf(k) < targetIndex) + 1;
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
    const sorted = [...activeKeys].sort(
      (a, b) => defaultLayout.indexOf(a) - defaultLayout.indexOf(b),
    );
    updateLayout(sorted);
  }

  function getSliderConfig(groupKey) {
    if (groupKey === 'statusLines') return {
      label: 'Lines to show',
      min: 1, max: 4,
      value: projectSettingsOverrides.description?.statusLineCount ?? 2,
      onChange: (val) => updateProjectOverride({
        description: { ...(projectSettingsOverrides.description || {}), statusLineCount: val },
      }),
    };
    if (groupKey === 'technicalLines') return {
      label: 'Lines to show',
      min: 2, max: 5,
      value: projectSettingsOverrides.description?.technicalLineCount ?? 3,
      onChange: (val) => updateProjectOverride({
        description: { ...(projectSettingsOverrides.description || {}), technicalLineCount: val },
      }),
    };
    return undefined;
  }

  function renderActiveBlock(blockKey, index) {
    const meta = KNOWN_BLOCK_META[blockKey] || { label: blockKey };
    const groups = TEMPLATE_GROUPS[blockKey];
    const isFirst = index === 0;
    const isLast = index === activeKeys.length - 1;

    let card;
    if (!groups) {
      const isCollapsible = blockKey === 'supportBlock';
      card = (
        <BlockInfoCard
          label={meta.label}
          subtitle={meta.subtitle}
          onRemove={() => removeFromLayout(blockKey)}
          collapsible={isCollapsible}
        >
          {isCollapsible && (
            <p className="tag-summary">Edit links in Project Settings → Links.</p>
          )}
        </BlockInfoCard>
      );
    } else if (groups.length === 1) {
      const group = groups[0];
      card = (
        <TemplateGroupCard
          label={meta.label}
          templates={getTemplates(group.key, group.path)}
          onUpdateTemplates={(t) => updateTemplates(group.key, group.path, t)}
          onReset={() => resetGroup(group.key, group.path)}
          onRemove={() => removeFromLayout(blockKey)}
          initialCollapsed={true}
          sliderConfig={getSliderConfig(group.key)}
        />
      );
    } else {
      card = (
        <CollapsibleBlockGroup label={meta.label} onRemove={() => removeFromLayout(blockKey)}>
          {groups.map((group) => (
            <TemplateGroupCard
              key={group.key}
              label={group.label}
              templates={getTemplates(group.key, group.path)}
              onUpdateTemplates={(t) => updateTemplates(group.key, group.path, t)}
              onReset={() => resetGroup(group.key, group.path)}
              initialCollapsed
              sliderConfig={getSliderConfig(group.key)}
            />
          ))}
        </CollapsibleBlockGroup>
      );
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
        {card}
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
                const meta = KNOWN_BLOCK_META[key] || { label: key };
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
