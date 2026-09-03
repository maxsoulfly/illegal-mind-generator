// Stage 0 of the Project Settings -> "Content Setup" IA rework: a pure
// navigation model + a resolver. NOTHING imports this yet — Stage 2 wires it
// into ProjectSettingsPage / ProjectSettingsContent. The 11 flat section
// chips collapse into 4 functional sections; every editor component stays
// exactly where it is and keeps writing the same
// projectSettingsOverrides.<domain> key. This file only describes navigation
// — no data/schema/engine change anywhere.

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
    // Sub-nav; the Blocks leaf keeps its own inner tab strip (BLOCK_TYPE_SUBTABS).
    kind: 'subnav',
    leaves: [
      { id: 'layout', label: 'Layout' },
      { id: 'blocks', label: 'Blocks' },
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
    // Single page (Project Info + Backup).
    kind: 'page',
    leaves: [
      { id: 'projectInfo', label: 'Project Info' },
      { id: 'backup', label: 'Backup' },
    ],
  },
];

// Old PROJECT_SETTING_SECTIONS id (and the strings the Generator output
// panels pass to onNavigateToSettings) -> { section, leaf } in the new IA.
const LEGACY_SECTION_MAP = {
  general:        { section: 'project',      leaf: 'projectInfo' },
  shortHooks:     { section: 'generation',   leaf: 'shortHooks' },
  titles:         { section: 'generation',   leaf: 'titles' },
  descriptions:   { section: 'descriptions', leaf: 'layout' },
  links:          { section: 'descriptions', leaf: 'links' },
  blocks:         { section: 'descriptions', leaf: 'blocks' },
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
//    from blocksTarget.subTab. 'placeholders' routes to its own Descriptions
//    leaf; every other subTab lands on the Blocks leaf (which then shows that
//    inner tab via its existing BLOCK_TYPE_SUBTABS strip, so the value is
//    passed through as `blocksSubTab`).
// Legacy map is checked before the passthrough because 'descriptions' is both
// a legacy id (-> layout leaf) and a new section id.
export function resolveContentSetupTarget(legacySection, blocksSubTab) {
  const base = LEGACY_SECTION_MAP[legacySection];
  if (base) {
    if (legacySection === 'blocks' && blocksSubTab === 'placeholders') {
      return { section: 'descriptions', leaf: 'placeholders' };
    }
    if (legacySection === 'blocks' && blocksSubTab) {
      return { ...base, blocksSubTab };
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
