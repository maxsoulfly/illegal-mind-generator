// Field-list config for Tag Editor's 4 phrase-based tabs (Titles/
// Descriptions/Short Hooks/Hashtags — Basics is structurally different and
// stays hand-written, see TagBasicsTab.jsx). Consumed by TagFieldTab.jsx,
// which renders one <TagPhraseEditor> per entry. `field`/`parentField`
// values must match the keys TagPhraseEditor writes back via
// updateTagOverride/tag.maps — see buildTagExplorerData.js's `maps` shape.
export const TAG_FIELD_TABS = {
  titles: [
    { field: 'title', title: 'Long title phrases' },
    { field: 'thumbnail', title: 'Thumbnail phrases' },
  ],
  descriptions: [
    { field: 'technical', parentField: 'description', title: 'Technical phrases' },
    { field: 'log', parentField: 'description', title: 'Log phrases' },
    { field: 'status', parentField: 'description', title: 'Status phrases' },
  ],
  shortHooks: [
    { field: 'nostalgia', parentField: 'shortHooks', title: 'Nostalgia' },
    { field: 'emotion', parentField: 'shortHooks', title: 'Emotion' },
    { field: 'transformation', parentField: 'shortHooks', title: 'Transformation' },
    { field: 'discussion', parentField: 'shortHooks', title: 'Discussion' },
    { field: 'musician', parentField: 'shortHooks', title: 'Musician' },
    { field: 'progress', parentField: 'shortHooks', title: 'Progress' },
  ],
  hashtags: [
    { field: 'hashtags', title: 'Hashtags' },
  ],
};

// Matches either sourceTarget shape in play today: {field, phraseText}
// (Titles-sourced clicks, e.g. ThumbnailsPanel.jsx) or {hookType, hookText}
// (Short-Hooks-sourced clicks, e.g. GeneratedTitle.jsx/DescriptionsPanel.jsx/
// ShortHookTitles.jsx). Safe uniformly across all 4 tabs' field names — no
// real sourceTarget ever sets field/hookType to a Descriptions/Hashtags
// field name, so those entries never spuriously match.
export function isSourceMatch(sourceTarget, entry) {
  return sourceTarget?.field === entry.field || sourceTarget?.hookType === entry.field;
}
