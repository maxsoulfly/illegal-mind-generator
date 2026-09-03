import Descriptions from './Descriptions';
import Lists from '../lists/Lists';
import TextBlocks from '../blocks/TextBlocks';
import HookBlocks from '../blocks/HookBlocks';
import BlockGroups from '../blocks/BlockGroups';
import Placeholders from '../blocks/Placeholders';
import LinksRegistryEditor from '../lists/LinksRegistryEditor';

// Stage 3 of the Content Setup IA rework: Descriptions + Blocks + Links +
// Placeholders are one workspace. The leaf sub-strip in ProjectSettingsPage
// is the only navigation now — the old stacked Descriptions[Long/Shorts] +
// Blocks[5-tab] SubTabNavs are gone. `layout` still renders <Descriptions>
// unchanged (its Long/Shorts SubTabNav is a real sub-choice, not redundant).
//
// Every editor below receives exactly the props Blocks.jsx /
// ProjectSettingsLinks.jsx passed it — no editor logic changed. The
// blockKey / highlight from a blocksTarget deep-link only apply to the leaf
// that link actually targeted (blocksTarget.subTab === leaf).
const LEAF_HEADINGS = {
  lists: 'Lists',
  text: 'Text Blocks',
  hooks: 'Hook Blocks',
  groups: 'Groups',
  placeholders: 'Placeholders',
  links: 'Links',
};

export default function DescriptionsWorkspace({
  activeLeaf,
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  blocksTarget,
  openBlocksEditor,
}) {
  const subTab = blocksTarget?.subTab;
  const openBlockKey = (leaf) => (subTab === leaf ? blocksTarget?.blockKey ?? null : null);
  const highlight = (leaf) => (subTab === leaf ? blocksTarget?.highlightText ?? null : null);

  const heading = LEAF_HEADINGS[activeLeaf];
  const withHeading = (node) => (
    <>
      <h2 className="panel-title">{heading}</h2>
      {node}
    </>
  );

  if (activeLeaf === 'lists') {
    return withHeading(
      <Lists
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        openBlockKey={openBlockKey('lists')}
        highlightItem={highlight('lists')}
      />,
    );
  }

  if (activeLeaf === 'text') {
    return withHeading(
      <TextBlocks
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        openBlockKey={openBlockKey('text')}
      />,
    );
  }

  if (activeLeaf === 'hooks') {
    return withHeading(
      <HookBlocks
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        openBlockKey={openBlockKey('hooks')}
        highlightText={highlight('hooks')}
      />,
    );
  }

  if (activeLeaf === 'groups') {
    return withHeading(
      <BlockGroups
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        openBlockKey={openBlockKey('groups')}
        onNavigateToBlock={openBlocksEditor}
      />,
    );
  }

  if (activeLeaf === 'placeholders') {
    return withHeading(
      <Placeholders
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        openBlockKey={openBlockKey('placeholders')}
      />,
    );
  }

  if (activeLeaf === 'links') {
    return withHeading(
      <LinksRegistryEditor
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />,
    );
  }

  // 'layout' (default) — <Descriptions> keeps its own <h2> + Long/Shorts SubTabNav.
  return (
    <Descriptions
      baseProjectConfig={baseProjectConfig}
      projectConfig={projectConfig}
      projectSettingsOverrides={projectSettingsOverrides}
      updateProjectOverride={updateProjectOverride}
      openBlocksEditor={openBlocksEditor}
    />
  );
}
