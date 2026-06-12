import { useState } from 'react';
import TemplateGroupCard from '../../ui/TemplateGroupCard';
import BlockInfoCard from '../../ui/BlockInfoCard';
import SubTabNav from '../../ui/SubTabNav';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

// Maps layout block names (engine keys) to display metadata
const KNOWN_BLOCK_META = {
  broadcastBlock:    { label: 'Broadcast Block',   subtitle: 'tag-driven' },
  introBlock:        { label: 'Intro Hook' },
  storyBlock:        { label: 'Story Block' },
  technicalBlock:    { label: 'Technical Block',   subtitle: 'tag-driven' },
  logBlock:          { label: 'Log Block',          subtitle: 'tag-driven' },
  closingBlock:      { label: 'Closing Block' },
  supportBlock:      { label: 'Support Block',      subtitle: 'links from config' },
  customCtaBlock:    { label: 'Custom CTA',          subtitle: 'editable in generator' },
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
  introBlock:  [{ key: 'introHook',     label: 'Intro Hook' }],
  storyBlock:  [{ key: 'storyBlock',    label: 'Story Block' }],
  logBlock:    [{ key: 'logNotes',      label: 'Log Notes' }],
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

  function renderActiveBlock(blockKey) {
    const meta = KNOWN_BLOCK_META[blockKey] || { label: blockKey };
    const groups = TEMPLATE_GROUPS[blockKey];

    if (!groups) {
      return (
        <BlockInfoCard
          key={blockKey}
          label={meta.label}
          subtitle={meta.subtitle}
          onRemove={() => removeFromLayout(blockKey)}
        />
      );
    }

    if (groups.length === 1) {
      const group = groups[0];
      return (
        <TemplateGroupCard
          key={blockKey}
          label={meta.label}
          templates={getTemplates(group.key, group.path)}
          onUpdateTemplates={(t) => updateTemplates(group.key, group.path, t)}
          onReset={() => resetGroup(group.key, group.path)}
          onRemove={() => removeFromLayout(blockKey)}
        />
      );
    }

    // Multiple template groups under one block — wrapper with single remove button
    return (
      <div key={blockKey} className="desc-block-group">
        <div className="desc-block-group-header">
          <span>{meta.label}</span>
          <button
            type="button"
            className="tag-reset-button"
            title="Remove from layout"
            onClick={() => removeFromLayout(blockKey)}
          >
            ×
          </button>
        </div>
        {groups.map((group) => (
          <TemplateGroupCard
            key={group.key}
            label={group.label}
            templates={getTemplates(group.key, group.path)}
            onUpdateTemplates={(t) => updateTemplates(group.key, group.path, t)}
            onReset={() => resetGroup(group.key, group.path)}
          />
        ))}
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
                    <button
                      type="button"
                      className="tag-reset-button"
                      title="Add to layout"
                      onClick={() => addToLayout(key)}
                    >
                      +
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="desc-layout-active">
          {activeKeys.map(renderActiveBlock)}
        </div>
      </div>
    </>
  );
}
