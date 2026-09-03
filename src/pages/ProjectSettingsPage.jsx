import SubTabNav from '../components/ui/SubTabNav';
import {
  CONTENT_SETUP_SECTIONS,
  getSection,
  getSectionLeaves,
  resolveContentSetupTarget,
  DESCRIPTION_GROUPS,
  groupOfDescriptionLeaf,
} from '../config/contentSetupNav';
import ProjectSettingsContent from '../components/projectSettings/ProjectSettingsContent';

// Content Setup: 4 section chips + a persistent second level.
//  - Generation / Descriptions (kind: 'workspace') — a persistent leaf
//    switcher (a SubTabNav) with the editor directly below. Descriptions
//    also has a persistent category row (Layouts / Blocks / Variables) above
//    its leaf switcher; the active category is derived from the current leaf
//    (groupOfDescriptionLeaf), never stored. No overview, no back step.
//  - Workflow / Project (kind: 'page') — one page, no leaf nav.
// Every rendered leaf maps to an existing ProjectSettingsContent dispatch
// id; that component + all editors are unchanged — this is navigation only.
// `leafMemory` (ui.contentSetupLeafMemory, persisted) remembers the last
// leaf per section (`generation`/`descriptions` — for a section-chip click)
// and per Descriptions category (`layouts`/`blocks`/`variables` — for a
// category click); it falls back to the first leaf when absent.
const LEAF_TO_DISPATCH = {
  titles: 'titles',
  shortHooks: 'shortHooks',
  thumbnails: 'thumbnails',
  hashtags: 'hashtags',
  long: 'descriptions',
  shorts: 'descriptions',
  lists: 'descriptions',
  text: 'descriptions',
  hooks: 'descriptions',
  groups: 'descriptions',
  placeholders: 'descriptions',
  links: 'descriptions',
  shortsQueue: 'workflow',
  todo: 'workflow',
  uploadSchedule: 'workflow',
  projectInfo: 'project',
};
const LEAF_IDS = new Set(Object.keys(LEAF_TO_DISPATCH));

const dispatchableLeaves = (sectionId) =>
  getSectionLeaves(sectionId).filter((leaf) => LEAF_IDS.has(leaf.id));

const sectionOfLeaf = (leafId) =>
  CONTENT_SETUP_SECTIONS.find((s) => s.leaves.some((l) => l.id === leafId))?.id ??
  'generation';

const descriptionLeafById = Object.fromEntries(
  getSectionLeaves('descriptions').map((l) => [l.id, l]),
);
const groupLeafIds = (categoryId) =>
  DESCRIPTION_GROUPS.find((g) => g.id === categoryId)?.leafIds ?? [];

// The persisted `activeSection` value can be a leaf id, a bare section id, or
// one of the pre-rework flat Project-Settings section ids still in some
// users' stored state. Normalise to { section, leaf } — leaf is always a
// real editor leaf for a 'workspace' section (never null).
function resolveStoredView(stored) {
  if (LEAF_IDS.has(stored)) {
    return { section: sectionOfLeaf(stored), leaf: stored };
  }
  const { section, leaf } = resolveContentSetupTarget(stored);
  if (leaf && LEAF_IDS.has(leaf)) return { section, leaf };
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
  leafMemory = {},
  setLeafMemory,
  otherProjects,
  syncHookTypesToProject,
  onOpenUIKit,
  showToast,
}) {
  const storedView = resolveStoredView(activeSection);

  // A click-to-navigate target overrides the stored view (same precedence the
  // old flat `resolvedSection` ternary used) and lands straight on a leaf,
  // routed through the resolver so deep-links keep hitting the right editor.
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

  const dispatchSection = LEAF_TO_DISPATCH[view.leaf] ?? 'project';
  const isWorkspace = getSection(view.section)?.kind === 'workspace';
  const activeCategory =
    view.section === 'descriptions'
      ? (groupOfDescriptionLeaf(view.leaf) ?? DESCRIPTION_GROUPS[0].id)
      : null;
  const leafTabs =
    view.section === 'generation'
      ? getSectionLeaves('generation')
      : view.section === 'descriptions'
        ? groupLeafIds(activeCategory).map((id) => descriptionLeafById[id])
        : [];

  function clearTargets() {
    if (shortHooksTarget) clearShortHooksTarget();
    if (titlesTarget) clearTitlesTarget();
    if (thumbnailsTarget) clearThumbnailsTarget();
    if (hashtagsTarget) clearHashtagsTarget();
    if (blocksTarget) clearBlocksTarget();
  }

  // Remember this leaf under its section key and (for a Descriptions leaf)
  // its category key, so a later section-chip / category click can restore it.
  function rememberLeaf(leafId) {
    if (!setLeafMemory || !LEAF_IDS.has(leafId)) return;
    const section = sectionOfLeaf(leafId);
    const category = groupOfDescriptionLeaf(leafId); // null unless Descriptions
    setLeafMemory((prev) => {
      const next = { ...prev, [section]: leafId };
      if (category) next[category] = leafId;
      return next;
    });
  }

  function selectLeaf(leafId) {
    rememberLeaf(leafId);
    onSectionChange(leafId);
    clearTargets();
  }

  // Descriptions category click: open the remembered leaf for that category
  // (if still valid), else its first leaf.
  function selectCategory(categoryId) {
    const ids = groupLeafIds(categoryId);
    const remembered = leafMemory[categoryId];
    selectLeaf(ids.includes(remembered) ? remembered : ids[0]);
  }

  function selectSection(sectionId) {
    if (getSection(sectionId)?.kind === 'page') {
      onSectionChange(sectionId);
      clearTargets();
      return;
    }
    // workspace: open the remembered leaf for that section, else its first.
    const remembered = leafMemory[sectionId];
    const target =
      remembered && LEAF_IDS.has(remembered) && sectionOfLeaf(remembered) === sectionId
        ? remembered
        : (dispatchableLeaves(sectionId)[0]?.id ?? 'titles');
    selectLeaf(target);
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

      {view.section === 'descriptions' && (
        <div className="tag-filters content-setup-subnav">
          {DESCRIPTION_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              className={activeCategory === group.id ? 'active' : ''}
              onClick={() => selectCategory(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
      )}

      {isWorkspace && leafTabs.length > 0 && (
        <SubTabNav
          className="content-setup-subnav"
          tabs={leafTabs}
          activeTab={view.leaf}
          onTabChange={selectLeaf}
        />
      )}

      <div className="panel">
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
      </div>
    </section>
  );
}
