import SubTabNav from '../ui/SubTabNav';
import ProjectSettingsLists from './ProjectSettingsLists';
import ProjectSettingsTextBlocks from './ProjectSettingsTextBlocks';

const BLOCKS_SUBTABS = [
  { id: 'lists', label: 'Lists' },
  { id: 'text', label: 'Text Blocks' },
];

export default function ProjectSettingsBlocks({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const activeSubTab = projectSettingsOverrides.blocks?.activeSubTab ?? 'lists';

  function setActiveSubTab(tab) {
    updateProjectOverride({
      blocks: {
        ...(projectSettingsOverrides.blocks || {}),
        activeSubTab: tab,
      },
    });
  }

  return (
    <>
      <h2 className="panel-title">Blocks</h2>

      <SubTabNav
        tabs={BLOCKS_SUBTABS}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {activeSubTab === 'lists' && (
        <ProjectSettingsLists
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
        />
      )}

      {activeSubTab === 'text' && (
        <ProjectSettingsTextBlocks
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
        />
      )}
    </>
  );
}
