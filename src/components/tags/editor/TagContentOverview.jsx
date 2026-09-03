import { TAG_CONTENT_SECTIONS, sectionCount } from '../../../utils/tagContentSections';

// Level 1 of the Tag card drill-down: a short meaning preview, an "Edit
// Basics" escape hatch (Label / Category / exclusions / Sync / Duplicate /
// Delete all live behind it now), and one clickable row per content type
// with its live phrase count. Counts come straight off `tag.maps` via
// sectionCount -- no duplicate state.
export default function TagContentOverview({ tag, onOpenSection, onEditBasics }) {
  return (
    <div className="tag-overview">
      {tag.promptContext ? (
        <p className="tag-overview-meaning">{tag.promptContext}</p>
      ) : (
        <p className="tag-overview-meaning tag-overview-meaning--empty">
          No meaning set — add one in Basics for better AI prompts.
        </p>
      )}

      <button
        type="button"
        className="button-secondary tag-overview-basics"
        onClick={onEditBasics}
      >
        Edit Basics
      </button>

      <ul className="tag-overview-list">
        {TAG_CONTENT_SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className="tag-overview-row"
              onClick={() => onOpenSection(section)}
            >
              <span className="tag-overview-row-label">{section.label}</span>
              <span className="tag-overview-row-count">{sectionCount(tag, section.id)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
