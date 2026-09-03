import SubTabNav from '../components/ui/SubTabNav';
import {
  CONTENT_SETUP_SECTIONS,
  getSectionLeaves,
  resolveContentSetupTarget,
} from '../config/contentSetupNav';
import ProjectSettingsContent from '../components/projectSettings/ProjectSettingsContent';

// Stage 2 of the Content Setup IA rework: the flat 11-chip strip becomes a
// two-level nav (4 section buttons + a contextual leaf sub-strip). Every
// rendered leaf still maps 1:1 to an existing ProjectSettingsContent
// dispatch id, and that component + all editors are untouched — this stage
// is navigation only.
//
// The `placeholders` (Descriptions) and `backup` (Project) leaves from
// contentSetupNav.js are Stage 3 / Stage 5 targets: not rendered yet, and
// their deep-links fall back to the Blocks / Project Info leaves here.
const LEAF_TO_DISPATCH = {
  titles: 'titles',
  shortHooks: 'shortHooks',
  thumbnails: 'thumbnails',
  hashtags: 'hashtags',
  layout: 'descriptions',
  blocks: 'blocks',
  links: 'links',
  shortsQueue: 'shortsQueue',
  todo: 'todo',
  uploadSchedule: 'uploadSchedule',
  projectInfo: 'general',
};
const LEAF_IDS = new Set(Object.keys(LEAF_TO_DISPATCH));

const stage2Leaves = (sectionId) =>
  getSectionLeaves(sectionId).filter((leaf) => LEAF_IDS.has(leaf.id));

const sectionOfLeaf = (leafId) =>
  CONTENT_SETUP_SECTIONS.find((s) => s.leaves.some((l) => l.id === leafId))?.id ??
  'generation';

// The persisted `activeSection` value may still be a legacy section id (from
// before this stage, or from openProjectSettings('descriptions')) — normalise
// anything to a Stage-2 leaf id.
function normalizeToLeaf(stored) {
  if (LEAF_IDS.has(stored)) return stored;
  const { section, leaf } = resolveContentSetupTarget(stored);
  if (leaf && LEAF_IDS.has(leaf)) return leaf;
  return stage2Leaves(section)[0]?.id ?? 'titles';
}

export default function ProjectSettingsPage({
  projectId,
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
  shortHooksTarget,
  clearShortHooksTarget,
  titlesTarget,
  clearTitlesTarget,
  thumbnailsTarget,
  clearThumbnailsTarget,
  hashtagsTarget,
  clearHashtagsTarget,
  blocksTarget,
  clearBlocksTarget,
  openBlocksEditor,
  activeSection,
  onSectionChange,
  otherProjects,
  syncHookTypesToProject,
  onOpenUIKit,
  showToast,
}) {
  const activeLeaf = normalizeToLeaf(activeSection);

  // A click-to-navigate target overrides the active leaf (same precedence the
  // old flat `resolvedSection` ternary used), routed through the Stage 0
  // resolver so deep-links keep landing on the right leaf.
  const legacyTargetSection = shortHooksTarget
    ? 'shortHooks'
    : titlesTarget
      ? 'titles'
      : thumbnailsTarget
        ? 'thumbnails'
        : hashtagsTarget
          ? 'hashtags'
          : blocksTarget
            ? 'blocks'
            : null;

  let view;
  if (legacyTargetSection) {
    const resolved = resolveContentSetupTarget(
      legacyTargetSection,
      blocksTarget?.subTab,
    );
    const leaf = LEAF_IDS.has(resolved.leaf)
      ? resolved.leaf
      : resolved.leaf === 'placeholders'
        ? 'blocks'
        : (stage2Leaves(resolved.section)[0]?.id ?? activeLeaf);
    view = { section: resolved.section, leaf };
  } else {
    view = { section: sectionOfLeaf(activeLeaf), leaf: activeLeaf };
  }

  const dispatchSection = LEAF_TO_DISPATCH[view.leaf] ?? 'general';
  const leaves = stage2Leaves(view.section);

  function selectLeaf(leafId) {
    onSectionChange(leafId);
    if (shortHooksTarget) clearShortHooksTarget();
    if (titlesTarget) clearTitlesTarget();
    if (thumbnailsTarget) clearThumbnailsTarget();
    if (hashtagsTarget) clearHashtagsTarget();
    if (blocksTarget) clearBlocksTarget();
  }

  function selectSection(sectionId) {
    selectLeaf(stage2Leaves(sectionId)[0]?.id ?? 'titles');
  }

  return (
    <section className="page-panel">
      <div className="tag-filters">
        {CONTENT_SETUP_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={view.section === section.id ? 'active' : ''}
            onClick={() => selectSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {leaves.length > 1 && (
        <SubTabNav tabs={leaves} activeTab={view.leaf} onTabChange={selectLeaf} />
      )}

      <div className="panel">
        <ProjectSettingsContent
          activeSection={dispatchSection}
          projectId={projectId}
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
          hookTarget={shortHooksTarget}
          titlesTarget={titlesTarget}
          thumbnailsTarget={thumbnailsTarget}
          hashtagsTarget={hashtagsTarget}
          blocksTarget={blocksTarget}
          clearBlocksTarget={clearBlocksTarget}
          openBlocksEditor={openBlocksEditor}
          otherProjects={otherProjects}
          syncHookTypesToProject={syncHookTypesToProject}
          onOpenUIKit={onOpenUIKit}
          showToast={showToast}
        />
      </div>
    </section>
  );
}
