import SubTabNav from '../../ui/SubTabNav';
import Lists from '../lists/Lists';
import TextBlocks from './TextBlocks';
import HookBlocks from './HookBlocks';
import BlockGroups from './BlockGroups';
import Placeholders from './Placeholders';
import { BLOCK_TYPE_SUBTABS } from '../../../utils/customBlocks';

const BLOCKS_SUBTABS = Object.values(BLOCK_TYPE_SUBTABS).map(({ subTab, label }) => ({
  id: subTab,
  label,
}));

export default function Blocks({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  blocksTarget,
  clearBlocksTarget,
  openBlocksEditor,
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
        <Lists
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'lists' ? blocksTarget.blockKey : null}
          highlightItem={blocksTarget?.subTab === 'lists' ? blocksTarget.highlightText : null}
        />
      )}

      {activeSubTab === 'text' && (
        <TextBlocks
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'text' ? blocksTarget.blockKey : null}
        />
      )}

      {activeSubTab === 'hooks' && (
        <HookBlocks
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'hooks' ? blocksTarget.blockKey : null}
          highlightText={blocksTarget?.subTab === 'hooks' ? blocksTarget.highlightText : null}
        />
      )}

      {activeSubTab === 'groups' && (
        <BlockGroups
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'groups' ? blocksTarget.blockKey : null}
          onNavigateToBlock={openBlocksEditor}
        />
      )}

      {activeSubTab === 'placeholders' && (
        <Placeholders
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          openBlockKey={blocksTarget?.subTab === 'placeholders' ? blocksTarget.blockKey : null}
        />
      )}
    </>
  );
}
