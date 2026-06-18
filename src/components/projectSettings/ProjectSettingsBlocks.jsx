import SubTabNav from '../ui/SubTabNav';
import ProjectSettingsLists from './ProjectSettingsLists';
import ProjectSettingsTextBlocks from './ProjectSettingsTextBlocks';
import ProjectSettingsHookBlocks from './ProjectSettingsHookBlocks';

const BLOCKS_SUBTABS = [
  { id: 'lists', label: 'Lists' },
  { id: 'text', label: 'Text Blocks' },
  { id: 'hooks', label: 'Hook Blocks' },
];

export default function ProjectSettingsBlocks({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  blocksTarget,
  clearBlocksTarget,
}) {
  const activeSubTab = blocksTarget?.subTab ?? projectSettingsOverrides.blocks?.activeSubTab ?? 'lists';

  function setActiveSubTab(tab) {
    if (blocksTarget) clearBlocksTarget();
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
          openBlockKey={blocksTarget?.subTab === 'lists' ? blocksTarget.blockKey : null}
        />
      )}

      {activeSubTab === 'text' && (
        <ProjectSettingsTextBlocks
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'text' ? blocksTarget.blockKey : null}
        />
      )}

      {activeSubTab === 'hooks' && (
        <ProjectSettingsHookBlocks
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'hooks' ? blocksTarget.blockKey : null}
        />
      )}
    </>
  );
}
