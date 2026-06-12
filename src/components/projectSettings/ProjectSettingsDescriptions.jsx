import SubTabNav from '../ui/SubTabNav';
import LongDescriptionSettings from './descriptions/LongDescriptionSettings';
import ShortsDescriptionSettings from './descriptions/ShortsDescriptionSettings';

const DESCRIPTION_SUBTABS = [
  { id: 'long', label: 'Long Description' },
  { id: 'shorts', label: 'Shorts Description' },
];

export default function ProjectSettingsDescriptions({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const activeSubTab = projectSettingsOverrides.description?.activeSubTab ?? 'long';

  function setActiveSubTab(tab) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        activeSubTab: tab,
      },
    });
  }

  return (
    <>
      <h2 className="panel-title">Descriptions</h2>

      <SubTabNav
        tabs={DESCRIPTION_SUBTABS}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {activeSubTab === 'long' && (
        <LongDescriptionSettings
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
        />
      )}

      {activeSubTab === 'shorts' && (
        <ShortsDescriptionSettings
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
        />
      )}
    </>
  );
}
