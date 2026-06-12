import { useState } from 'react';
import TemplateGroupCard from '../../ui/TemplateGroupCard';
import SubTabNav from '../../ui/SubTabNav';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

// All editable long description template groups. Step 5 will add more entries here.
const ALL_GROUPS = [
  { key: 'introHook', label: 'Intro Hook' },
  { key: 'storyBlock', label: 'Story Block' },
  { key: 'philosophyLine', label: 'Philosophy Line' },
  { key: 'closingSignal', label: 'Closing Signal' },
];

const DEFAULT_ACTIVE_KEYS = ALL_GROUPS.map((g) => g.key);

export default function LongDescriptionSettings({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const [mobileTab, setMobileTab] = useState('layout');
  const longTemplates = projectConfig.description?.templates?.long || {};

  // Which groups are in the active layout (persisted in overrides).
  const activeKeys =
    projectSettingsOverrides.description?.editorLayout ?? DEFAULT_ACTIVE_KEYS;

  const activeGroups = activeKeys
    .map((key) => ALL_GROUPS.find((g) => g.key === key))
    .filter(Boolean);

  const availableGroups = ALL_GROUPS.filter((g) => !activeKeys.includes(g.key));

  function updateEditorLayout(newKeys) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        editorLayout: newKeys,
      },
    });
  }

  function addToLayout(key) {
    updateEditorLayout([...activeKeys, key]);
  }

  function removeFromLayout(key) {
    updateEditorLayout(activeKeys.filter((k) => k !== key));
  }

  function updateLongTemplates(key, newTemplates) {
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

  function resetLongGroup(key) {
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
          {availableGroups.length === 0 ? (
            <p className="tag-summary">All blocks are in the layout.</p>
          ) : (
            <ul className="desc-available-list">
              {availableGroups.map(({ key, label }) => (
                <li key={key} className="desc-available-item">
                  <span>{label}</span>
                  <button
                    type="button"
                    className="tag-reset-button"
                    title="Add to layout"
                    onClick={() => addToLayout(key)}
                  >
                    +
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="desc-layout-active">
          {activeGroups.map(({ key, label }) => {
            const templates = longTemplates[key] || [];

            return (
              <TemplateGroupCard
                key={key}
                label={label}
                templates={templates}
                onUpdateTemplates={(newTemplates) => updateLongTemplates(key, newTemplates)}
                onReset={() => resetLongGroup(key)}
                onRemove={() => removeFromLayout(key)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
