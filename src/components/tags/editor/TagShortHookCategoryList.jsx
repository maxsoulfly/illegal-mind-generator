import { useState } from 'react';

import { getShortHookCategories } from '../../../utils/tagContentSections';

// Level 2 of the Short Hooks drill: the one content type with genuinely
// multiple pools. Categories come from projectConfig.shortHookTypes (all 7,
// incl. Contrast) -- not the old hardcoded 6 -- so a per-tag Contrast pool
// is finally editable. The search box helps locate a half-remembered hook:
// it filters the category list to those with a matching phrase (or a
// matching category name) and shows the match count.
export default function TagShortHookCategoryList({ tag, projectConfig, onOpenCategory }) {
  const [search, setSearch] = useState('');

  const needle = search.trim().toLowerCase();
  const rows = getShortHookCategories(projectConfig)
    .map((cat) => {
      const phrases = tag.maps?.shortHooks?.[cat.id] || [];
      if (!needle) return { ...cat, count: phrases.length, shown: true };

      const labelMatch = cat.label.toLowerCase().includes(needle);
      const count = labelMatch
        ? phrases.length
        : phrases.filter((phrase) => phrase.toLowerCase().includes(needle)).length;
      return { ...cat, count, shown: labelMatch || count > 0 };
    })
    .filter((row) => row.shown);

  return (
    <div className="tag-drill-list-screen">
      <input
        className="form-input"
        type="search"
        placeholder="Search hooks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className="tag-overview-list">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              className="tag-overview-row"
              onClick={() => onOpenCategory(row)}
            >
              <span className="tag-overview-row-label">{row.label}</span>
              <span className="tag-drill-row-end">
                <span className="tag-overview-row-count">{row.count}</span>
                <span className="tag-drill-chevron" aria-hidden="true">›</span>
              </span>
            </button>
          </li>
        ))}

        {rows.length === 0 && <li className="tag-show-more">No hooks found.</li>}
      </ul>
    </div>
  );
}
