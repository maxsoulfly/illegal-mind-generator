import { useState } from 'react';
import TemplateGroupCard from '../../ui/TemplateGroupCard';
import LabelSliderRow from '../../ui/LabelSliderRow';
import SubTabNav from '../../ui/SubTabNav';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

const ALL_GROUPS = [
  { key: 'header', label: 'Header' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
];

const DEFAULT_ACTIVE_KEYS = ALL_GROUPS.map((g) => g.key);

export default function ShortsDescriptionSettings({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const [mobileTab, setMobileTab] = useState('layout');

  const shortsConfig = projectConfig.description?.templates?.shorts || {};
  const overriddenShorts =
    projectSettingsOverrides.description?.templates?.shorts || {};

  const count = overriddenShorts.count ?? shortsConfig.count ?? 3;

  const activeKeys =
    projectSettingsOverrides.description?.shortsEditorLayout ??
    DEFAULT_ACTIVE_KEYS;

  const activeGroups = activeKeys
    .map((key) => ALL_GROUPS.find((g) => g.key === key))
    .filter(Boolean);

  const availableGroups = ALL_GROUPS.filter((g) => !activeKeys.includes(g.key));

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

  function updateTemplates(key, newTemplates) {
    updateShortsField(key, newTemplates);
  }

  function resetGroup(key) {
    const { [key]: _removed, ...remaining } = overriddenShorts;
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          shorts: remaining,
        },
      },
    });
  }

  function updateEditorLayout(newKeys) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        shortsEditorLayout: newKeys,
      },
    });
  }

  function addToLayout(key) {
    updateEditorLayout([...activeKeys, key]);
  }

  function removeFromLayout(key) {
    updateEditorLayout(activeKeys.filter((k) => k !== key));
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
            const templates = overriddenShorts[key] ?? shortsConfig[key] ?? [];

            return (
              <TemplateGroupCard
                key={key}
                label={label}
                templates={templates}
                onUpdateTemplates={(newTemplates) =>
                  updateTemplates(key, newTemplates)
                }
                onReset={() => resetGroup(key)}
                onRemove={() => removeFromLayout(key)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
