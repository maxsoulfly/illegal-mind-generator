// The navigation model for the "Content Setup" section (formerly the flat
// 11-chip "Project Settings"). Consumed by ProjectSettingsPage.jsx.
//
// The 11 chips became 4 functional sections:
//   generation   (kind: 'drill')  — overview -> Titles / Short Hooks /
//                                    Thumbnails / Hashtags editor + back
//   descriptions (kind: 'subnav') — one workspace, flat leaf strip:
//                                    Long / Shorts / Lists / Text / Hook
//                                    Blocks / Groups / Placeholders / Links
//   workflow     (kind: 'page')   — Shorts Queue + Todo Statuses + Upload
//                                    Schedule on one page
//   project      (kind: 'page')   — project name/id + app-wide Backup
//
// Pure navigation — every editor keeps writing the same
// projectSettingsOverrides.<domain> key; no data/schema/engine change.
// `resolveContentSetupTarget` keeps the pre-rework section ids + the
// Generator output panels' onNavigateToSettings strings + blocksTarget.subTab
// resolving to the right { section, leaf }.

export const CONTENT_SETUP_SECTIONS = [
  {
    id: 'generation',
    label: 'Generation',
    // Level-2 drill-down (overview -> leaf), same shape as the Tag Library card.
    kind: 'drill',
    leaves: [
      { id: 'titles', label: 'Titles' },
      { id: 'shortHooks', label: 'Short Hooks' },
      { id: 'thumbnails', label: 'Thumbnails' },
      { id: 'hashtags', label: 'Hashtags & YouTube Tags' },
    ],
  },
  {
    id: 'descriptions',
    label: 'Descriptions',
    // One workspace: both description modes + every block type + placeholders
    // + links, on a single flat leaf strip. Stage 3 flattened the old stacked
    // Descriptions[Long/Shorts] + Blocks[5-tab] SubTabNavs into a `layout`
    // leaf that still nested a Long/Shorts SubTabNav; this stage promotes
    // Long and Shorts to first-class leaves and drops that inner strip. The
    // block-editor leaf ids are the BLOCK_TYPE_SUBTABS subtab ids verbatim
    // (lists/text/hooks/groups/placeholders) so blocksTarget.subTab and every
    // openBlocksEditor deep-link keep working unchanged.
    kind: 'subnav',
    leaves: [
      { id: 'long', label: 'Long' },
      { id: 'shorts', label: 'Shorts' },
      { id: 'lists', label: 'Lists' },
      { id: 'text', label: 'Text Blocks' },
      { id: 'hooks', label: 'Hook Blocks' },
      { id: 'groups', label: 'Groups' },
      { id: 'placeholders', label: 'Placeholders' },
      { id: 'links', label: 'Links' },
    ],
  },
  {
    id: 'workflow',
    label: 'Workflow',
    // Single page, cards stacked (Shorts Queue + Todo + Upload Schedule).
    kind: 'page',
    leaves: [
      { id: 'shortsQueue', label: 'Shorts Queue' },
      { id: 'todo', label: 'Todo Statuses' },
      { id: 'uploadSchedule', label: 'Upload Schedule' },
    ],
  },
  {
    id: 'project',
    label: 'Project',
    // Single page — the Project editor (project name/id + app-wide Backup).
    kind: 'page',
    leaves: [{ id: 'projectInfo', label: 'Project' }],
  },
];

// Old PROJECT_SETTING_SECTIONS id (and the strings the Generator output
// panels pass to onNavigateToSettings) -> { section, leaf } in the new IA.
const LEGACY_SECTION_MAP = {
  general:        { section: 'project',      leaf: 'projectInfo' },
  shortHooks:     { section: 'generation',   leaf: 'shortHooks' },
  titles:         { section: 'generation',   leaf: 'titles' },
  descriptions:   { section: 'descriptions', leaf: 'long' }, // default description mode
  layout:         { section: 'descriptions', leaf: 'long' }, // retired leaf id -> default mode
  links:          { section: 'descriptions', leaf: 'links' },
  blocks:         { section: 'descriptions', leaf: 'lists' }, // no-subTab fallback (first block leaf)
  thumbnails:     { section: 'generation',   leaf: 'thumbnails' },
  hashtags:       { section: 'generation',   leaf: 'hashtags' },
  todo:           { section: 'workflow',     leaf: 'todo' },
  shortsQueue:    { section: 'workflow',     leaf: 'shortsQueue' },
  uploadSchedule: { section: 'workflow',     leaf: 'uploadSchedule' },
};

const SECTION_IDS = new Set(CONTENT_SETUP_SECTIONS.map((s) => s.id));

// Resolve a click-to-navigate target to its home in the new IA.
//  - legacySection: an old PROJECT_SETTING_SECTIONS id, an
//    onNavigateToSettings string, or (idempotent) a new section id.
//  - blocksSubTab: only meaningful when legacySection === 'blocks' — carried
//    from blocksTarget.subTab. Since Stage 3 the block subtab ids
//    (lists|text|hooks|groups|placeholders) ARE Descriptions leaf ids, so the
//    subTab is the leaf directly.
// Legacy map is checked before the passthrough because 'descriptions' is both
// a legacy id (-> layout leaf) and a new section id.
export function resolveContentSetupTarget(legacySection, blocksSubTab) {
  const base = LEGACY_SECTION_MAP[legacySection];
  if (base) {
    if (legacySection === 'blocks' && blocksSubTab) {
      return { section: 'descriptions', leaf: blocksSubTab };
    }
    return base;
  }

  if (SECTION_IDS.has(legacySection)) {
    return { section: legacySection, leaf: null };
  }

  return { section: 'project', leaf: 'projectInfo' };
}

export function getSection(sectionId) {
  return CONTENT_SETUP_SECTIONS.find((s) => s.id === sectionId) ?? null;
}

export function getSectionLeaves(sectionId) {
  return getSection(sectionId)?.leaves ?? [];
}

export function isValidLeaf(sectionId, leafId) {
  return getSectionLeaves(sectionId).some((l) => l.id === leafId);
}

// One step back for a drill / sub-nav view: a leaf -> its section overview;
// the section overview -> null (from there the section strip is the parent).
export function parentOf(view) {
  if (view?.leaf) return { section: view.section, leaf: null };
  return null;
}
