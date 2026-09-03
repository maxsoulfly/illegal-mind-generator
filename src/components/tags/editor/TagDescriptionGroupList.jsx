import { DESCRIPTION_GROUPS, descriptionGroupCount } from '../../../utils/tagContentSections';

// Level 2 of the Descriptions drill: the three sub-pools (Technical / Log /
// Status) never flattened together. Fixed set, so no search -- just a row
// per group with its live phrase count, drilling to a single-pool editor.
export default function TagDescriptionGroupList({ tag, onOpenGroup }) {
  return (
    <ul className="tag-overview-list">
      {DESCRIPTION_GROUPS.map((group) => (
        <li key={group.id}>
          <button
            type="button"
            className="tag-overview-row"
            onClick={() => onOpenGroup(group)}
          >
            <span className="tag-overview-row-label">{group.label}</span>
            <span className="tag-drill-row-end">
              <span className="tag-overview-row-count">
                {descriptionGroupCount(tag, group.id)}
              </span>
              <span className="tag-drill-chevron" aria-hidden="true">›</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
