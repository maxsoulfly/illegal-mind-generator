import { getSectionLeaves } from '../../../config/contentSetupNav';

// Stage 4 of the Content Setup IA rework: the Generation section is a
// drill-down (overview -> editor), same shape as the Tag Library card.
// Counts are read live from the resolved projectConfig — no duplicate state.
// A deep-link from a Generator output panel skips this overview and opens
// the leaf directly (handled in ProjectSettingsPage).
const COUNT = {
  titles: (pc) =>
    Object.values(pc.title?.templates || {}).reduce((n, arr) => n + (arr?.length || 0), 0),
  shortHooks: (pc) =>
    Object.values(pc.shortHookTypes || {}).reduce((n, t) => n + (t?.templates?.length || 0), 0),
  thumbnails: (pc) => {
    const t = pc.thumbnail || {};
    return (
      (t.words?.length || 0) +
      (t.fallbacks?.length || 0) +
      (t.genericTagTemplates?.length || 0)
    );
  },
  hashtags: (pc) => (pc.hashtags?.base?.length || 0) + (pc.youtubetags?.base?.length || 0),
};

export default function GenerationOverview({ projectConfig, onOpen }) {
  return (
    <section>
      <h2 className="panel-title">Generation</h2>
      <ul className="tag-overview-list">
        {getSectionLeaves('generation').map((leaf) => (
          <li key={leaf.id}>
            <button
              type="button"
              className="tag-overview-row"
              onClick={() => onOpen(leaf.id)}
            >
              <span className="tag-overview-row-label">{leaf.label}</span>
              <span className="tag-overview-row-count">{COUNT[leaf.id](projectConfig)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
