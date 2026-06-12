import { useState } from 'react';
import TemplateGroupCard from '../../ui/TemplateGroupCard';
import SubTabNav from '../../ui/SubTabNav';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

const LONG_GROUPS = [
  { key: 'introHook', label: 'Intro Hook' },
  { key: 'storyBlock', label: 'Story Block' },
  { key: 'philosophyLine', label: 'Philosophy Line' },
  { key: 'closingSignal', label: 'Closing Signal' },
];

export default function LongDescriptionSettings({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const [mobileTab, setMobileTab] = useState('layout');
  const longTemplates = projectConfig.description?.templates?.long || {};

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
        <p className="tag-summary">Unused blocks will appear here.</p>
      </aside>

      <div className="desc-layout-active">
        {LONG_GROUPS.map(({ key, label }) => {
          const templates = longTemplates[key] || [];

          return (
            <TemplateGroupCard
              key={key}
              label={label}
              templates={templates}
              onUpdateTemplates={(newTemplates) => updateLongTemplates(key, newTemplates)}
              onReset={() => resetLongGroup(key)}
            />
          );
        })}
      </div>
    </div>
    </>
  );
}
