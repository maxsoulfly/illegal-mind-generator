import SubTabNav from '../components/ui/SubTabNav';
import {
  CONTENT_SETUP_SECTIONS,
  getSection,
  getSectionLeaves,
  resolveContentSetupTarget,
} from '../config/contentSetupNav';
import ProjectSettingsContent from '../components/projectSettings/ProjectSettingsContent';
import GenerationOverview from '../components/projectSettings/generation/GenerationOverview';

// Content Setup IA rework. The flat 11-chip strip is a two-level nav:
//  - 4 section buttons (Generation / Descriptions / Workflow / Project)
//  - Generation (kind: 'drill') opens to an overview, then drills to one
//    editor with a "<- Generation" back path (Stage 4).
//  - Descriptions (kind: 'subnav') shows a contextual leaf strip.
//  - Workflow / Project (kind: 'page') show one page, no strip — Workflow
//    stacks its three planning configs (Stage 5), Project is the General
//    editor (Project Info + app-wide Backup).
// Every rendered leaf maps to an existing ProjectSettingsContent dispatch
// id; that component + all editors are unchanged — this is navigation only.
const LEAF_TO_DISPATCH = {
  titles: 'titles',
  shortHooks: 'shortHooks',
  thumbnails: 'thumbnails',
  hashtags: 'hashtags',
  layout: 'descriptions',
  lists: 'descriptions',
  text: 'descriptions',
  hooks: 'descriptions',
  groups: 'descriptions',
  placeholders: 'descriptions',
  links: 'descriptions',
  shortsQueue: 'workflow',
  todo: 'workflow',
  uploadSchedule: 'workflow',
  projectInfo: 'general',
};
const LEAF_IDS = new Set(Object.keys(LEAF_TO_DISPATCH));

const DRILL_SECTIONS = new Set(
  CONTENT_SETUP_SECTIONS.filter((s) => s.kind === 'drill').map((s) => s.id),
);

const dispatchableLeaves = (sectionId) =>
  getSectionLeaves(sectionId).filter((leaf) => LEAF_IDS.has(leaf.id));

const sectionOfLeaf = (leafId) =>
  CONTENT_SETUP_SECTIONS.find((s) => s.leaves.some((l) => l.id === leafId))?.id ??
  'generation';

const sectionLabel = (sectionId) =>
  CONTENT_SETUP_SECTIONS.find((s) => s.id === sectionId)?.label ?? sectionId;

// The persisted `activeSection` value can be a leaf id, a bare section id
// (drill-section overview, or a legacy id from openProjectSettings), or one
// of the pre-rework flat Project-Settings section ids still in some users'
// stored state. Normalise to { section, leaf } — leaf is null only for a
// drill section's overview.
function resolveStoredView(stored) {
  if (LEAF_IDS.has(stored)) {
    return { section: sectionOfLeaf(stored), leaf: stored };
  }
  const { section, leaf } = resolveContentSetupTarget(stored);
  if (leaf && LEAF_IDS.has(leaf)) return { section, leaf };
  if (DRILL_SECTIONS.has(section)) return { section, leaf: null };
  return { section, leaf: dispatchableLeaves(section)[0]?.id ?? 'titles' };
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
  const storedView = resolveStoredView(activeSection);

  // A click-to-navigate target overrides the stored view (same precedence the
  // old flat `resolvedSection` ternary used) and always drills straight to a
  // leaf — skipping the Generation overview — routed through the resolver so
  // deep-links keep landing on the right leaf.
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
    const resolved = resolveContentSetupTarget(legacyTargetSection, blocksTarget?.subTab);
    const leaf = LEAF_IDS.has(resolved.leaf)
      ? resolved.leaf
      : (dispatchableLeaves(resolved.section)[0]?.id ?? storedView.leaf);
    view = { section: resolved.section, leaf };
  } else {
    view = storedView;
  }

  const isDrill = DRILL_SECTIONS.has(view.section);
  const showOverview = isDrill && view.leaf == null;
  const dispatchSection = LEAF_TO_DISPATCH[view.leaf] ?? 'general';
  // Only a 'subnav' section (Descriptions) gets a leaf strip; 'drill' and
  // 'page' sections don't.
  const leaves =
    getSection(view.section)?.kind === 'subnav' ? dispatchableLeaves(view.section) : [];

  function clearTargets() {
    if (shortHooksTarget) clearShortHooksTarget();
    if (titlesTarget) clearTitlesTarget();
    if (thumbnailsTarget) clearThumbnailsTarget();
    if (hashtagsTarget) clearHashtagsTarget();
    if (blocksTarget) clearBlocksTarget();
  }

  function selectLeaf(leafId) {
    onSectionChange(leafId);
    clearTargets();
  }

  function selectSection(sectionId) {
    onSectionChange(
      getSection(sectionId)?.kind === 'subnav'
        ? (dispatchableLeaves(sectionId)[0]?.id ?? 'titles') // land on the first leaf
        : sectionId, // drill -> overview; page -> the page
    );
    clearTargets();
  }

  function goToOverview() {
    onSectionChange(view.section);
    clearTargets();
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

      {isDrill && !showOverview && (
        <div className="tag-drill-header">
          <button type="button" className="tag-drill-back" onClick={goToOverview}>
            ← {sectionLabel(view.section)}
          </button>
        </div>
      )}

      <div className="panel">
        {showOverview ? (
          <GenerationOverview projectConfig={projectConfig} onOpen={selectLeaf} />
        ) : (
          <ProjectSettingsContent
            activeSection={dispatchSection}
            descriptionsLeaf={view.leaf}
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
            openBlocksEditor={openBlocksEditor}
            otherProjects={otherProjects}
            syncHookTypesToProject={syncHookTypesToProject}
            onOpenUIKit={onOpenUIKit}
            showToast={showToast}
          />
        )}
      </div>
    </section>
  );
}
