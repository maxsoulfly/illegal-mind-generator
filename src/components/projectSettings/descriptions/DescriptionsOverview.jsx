import { DESCRIPTION_GROUPS, getSectionLeaves } from '../../../config/contentSetupNav';

// Level 1 of the Descriptions drill (Descriptions is `kind: 'drill'`, same as
// `generation` / the Tag Library card). The 8 existing editors, grouped by
// role — Variables feed Blocks feed Layouts. Selecting a row calls `onOpen`
// with that leaf id, which drills straight into the existing editor (with a
// "<- Descriptions" back header, wired in ProjectSettingsPage). Deep-links
// (blocksTarget, the Generator DESCRIPTIONS panel via 'long') never reach
// here — they set `view.leaf` directly and skip the overview.
//
// Reuses the drill-overview primitives (.tag-overview-list / .tag-overview-row)
// verbatim; the only additions are a per-group heading (.tag-category, the
// existing category-label class) and the flow caption (.tag-card-subtitle).
export default function DescriptionsOverview({ onOpen }) {
  const leafLabel = Object.fromEntries(
    getSectionLeaves('descriptions').map((l) => [l.id, l.label]),
  );

  return (
    <section>
      <h2 className="panel-title">Descriptions</h2>
      <p className="tag-card-subtitle">Variables → Blocks → Layouts → Descriptions</p>

      {DESCRIPTION_GROUPS.map((group, i) => (
        <div
          key={group.id}
          style={{ marginTop: i === 0 ? 'var(--space-4)' : 'var(--space-6)' }}
        >
          <div className="tag-category">{group.label}</div>
          <ul className="tag-overview-list">
            {group.leafIds.map((leafId) => (
              <li key={leafId}>
                <button
                  type="button"
                  className="tag-overview-row"
                  onClick={() => onOpen(leafId)}
                >
                  <span className="tag-overview-row-label">{leafLabel[leafId]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
