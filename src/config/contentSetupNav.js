// The navigation model for the "Content Setup" section (formerly the flat
// 11-chip "Project Settings"). Consumed by ProjectSettingsPage.jsx.
//
// The 11 chips became 4 functional sections:
//   generation   (kind: 'drill')  — overview -> Titles / Short Hooks /
//                                    Thumbnails / Hashtags editor + back
//   descriptions (kind: 'drill')  — grouped overview (Layouts / Blocks /
//                                    Variables, see DESCRIPTION_GROUPS) ->
//                                    one of the 8 editors + "<- Descriptions"
//                                    back. The 8 leaf ids are unchanged
//                                    (long/shorts + the 5 BLOCK_TYPE_SUBTABS
//                                    ids + links) so every blocksTarget /
//                                    openBlocksEditor deep-link keeps landing
//                                    on its editor directly, skipping the
//                                    overview.
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
    // Drill-down (same shape as `generation` / the Tag Library card): a
    // grouped overview -> one editor + a "<- Descriptions" back header. The
    // 8 leaves stay a flat array here (dispatchableLeaves / sectionOfLeaf /
    // the blocksTarget deep-link path all read it) — DESCRIPTION_GROUPS
    // below is the *display* grouping the overview screen uses. Leaf ids are
    // unchanged: `long`/`shorts` + the BLOCK_TYPE_SUBTABS ids
    // (lists/text/hooks/groups/placeholders) + `links`, so blocksTarget.subTab
    // and every openBlocksEditor deep-link keep landing on their editor
    // directly, skipping the overview.
    kind: 'drill',
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

// Display grouping for the Descriptions drill overview. Purely presentational
// — the leaf ids are the same ones in CONTENT_SETUP_SECTIONS.descriptions.
// Conceptual flow: Variables -> Blocks -> Layouts -> Descriptions.
export const DESCRIPTION_GROUPS = [
  { id: 'layouts',   label: 'Layouts',   leafIds: ['long', 'shorts'] },
  { id: 'blocks',    label: 'Blocks',    leafIds: ['lists', 'text', 'hooks', 'groups'] },
  { id: 'variables', label: 'Variables', leafIds: ['placeholders', 'links'] },
];

export function groupOfDescriptionLeaf(leafId) {
  return DESCRIPTION_GROUPS.find((g) => g.leafIds.includes(leafId))?.id ?? null;
}

// Old PROJECT_SETTING_SECTIONS id (and the strings the Generator output
// panels pass to onNavigateToSettings) -> { section, leaf } in the new IA.
const LEGACY_SECTION_MAP = {
  general:        { section: 'project',      leaf: 'projectInfo' },
  shortHooks:     { section: 'generation',   leaf: 'shortHooks' },
  titles:         { section: 'generation',   leaf: 'titles' },
  descriptions:   { section: 'descriptions', leaf: null }, // bare id -> the grouped overview
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
// Legacy map is checked before the passthrough. 'descriptions' is in both:
// as a legacy id it now resolves to { section: 'descriptions', leaf: null }
// (the grouped overview) — same result the SECTION_IDS passthrough would
// give, so the two agree. The Generator "DESCRIPTIONS" panel deep-links via
// 'long' (a real leaf id), not 'descriptions', so it lands on an editor.
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
