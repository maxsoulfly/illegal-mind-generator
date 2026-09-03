import LongDescriptionSettings from './LongDescriptionSettings';
import ShortsDescriptionSettings from './ShortsDescriptionSettings';
import Lists from '../lists/Lists';
import TextBlocks from '../blocks/TextBlocks';
import HookBlocks from '../blocks/HookBlocks';
import BlockGroups from '../blocks/BlockGroups';
import Placeholders from '../blocks/Placeholders';
import LinksRegistryEditor from '../lists/LinksRegistryEditor';

// Descriptions + Blocks + Links + Placeholders are one workspace. The leaf
// sub-strip in ProjectSettingsPage is the only navigation — the old stacked
// Descriptions[Long/Shorts] + Blocks[5-tab] SubTabNavs are gone, and the
// former `layout` leaf (which only existed to nest a Long/Shorts SubTabNav)
// is retired: Long and Shorts are first-class leaves now, each rendering the
// existing editor directly. `Descriptions.jsx` was deleted with this change.
//
// Every editor below is rendered exactly as it was before the merge — no
// editor logic, reset behavior, or write path changed. The blockKey /
// highlight from a blocksTarget deep-link only apply to the leaf that link
// actually targeted (blocksTarget.subTab === leaf). Legacy `descriptions`
// and stale `layout` navigation/persistence both resolve to the `long` leaf
// (see contentSetupNav.js LEGACY_SECTION_MAP).
const LEAF_HEADINGS = {
  long: 'Long Description',
  shorts: 'Shorts Description',
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

  // Unrecognized leaf falls back to the default description mode.
  const leaf = LEAF_HEADINGS[activeLeaf] ? activeLeaf : 'long';
  const withHeading = (node) => (
    <>
      <h2 className="panel-title">{LEAF_HEADINGS[leaf]}</h2>
      {node}
    </>
  );

  if (leaf === 'shorts') {
    return withHeading(
      <ShortsDescriptionSettings
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        onNavigateToBlock={openBlocksEditor}
      />,
    );
  }

  if (leaf === 'lists') {
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

  if (leaf === 'text') {
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

  if (leaf === 'hooks') {
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

  if (leaf === 'groups') {
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

  if (leaf === 'placeholders') {
    return withHeading(
      <Placeholders
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        openBlockKey={openBlockKey('placeholders')}
      />,
    );
  }

  if (leaf === 'links') {
    return withHeading(
      <LinksRegistryEditor
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />,
    );
  }

  // 'long' (default) — the former `layout` leaf's Long editor, promoted.
  return withHeading(
    <LongDescriptionSettings
      baseProjectConfig={baseProjectConfig}
      projectConfig={projectConfig}
      projectSettingsOverrides={projectSettingsOverrides}
      updateProjectOverride={updateProjectOverride}
      onNavigateToBlock={openBlocksEditor}
    />,
  );
}
