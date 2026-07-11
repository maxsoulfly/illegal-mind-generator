import SubTabNav from '../ui/SubTabNav';
import ProjectSettingsLists from './ProjectSettingsLists';
import ProjectSettingsTextBlocks from './ProjectSettingsTextBlocks';
import ProjectSettingsHookBlocks from './ProjectSettingsHookBlocks';
import ProjectSettingsBlockGroups from './ProjectSettingsBlockGroups';
import ProjectSettingsPlaceholders from './ProjectSettingsPlaceholders';
import { BLOCK_TYPE_SUBTABS } from '../../utils/customBlocks';

const BLOCKS_SUBTABS = Object.values(BLOCK_TYPE_SUBTABS).map(({ subTab, label }) => ({
  id: subTab,
  label,
}));

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
          highlightItem={blocksTarget?.subTab === 'lists' ? blocksTarget.highlightText : null}
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
          highlightText={blocksTarget?.subTab === 'hooks' ? blocksTarget.highlightText : null}
        />
      )}

      {activeSubTab === 'groups' && (
        <ProjectSettingsBlockGroups
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'groups' ? blocksTarget.blockKey : null}
        />
      )}

      {activeSubTab === 'placeholders' && (
        <ProjectSettingsPlaceholders
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'placeholders' ? blocksTarget.blockKey : null}
        />
      )}
    </>
  );
}
