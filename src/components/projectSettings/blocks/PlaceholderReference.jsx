import { useState } from 'react';
import TemplateGroupCard from '../../ui/TemplateGroupCard';
import { buildPlaceholderReference, buildPlaceholderPrompt } from '../../../utils/placeholderReference';

// Groups rendered below, in display order — keys match
// buildPlaceholderReference's return shape (placeholderReference.js).
const REFERENCE_GROUPS = [
  { key: 'builtIn', title: 'Built-in' },
  { key: 'tagCategories', title: 'Tag Categories' },
  { key: 'links', title: 'Project Links' },
  { key: 'custom', title: 'Custom' },
];

// Read-only reference of every placeholder usable in this project right now
// (built-in engine tokens, {tags.*} categories, this project's {links.*},
// and this project's {custom.*} definitions) — the editable custom-placeholder
// cards below only ever showed the last group, leaving everything else
// discoverable only by opening a {-autocomplete dropdown somewhere else.
function PlaceholderReference({ projectConfig }) {
  const [copied, setCopied] = useState(false);
  const reference = buildPlaceholderReference(projectConfig);

  function handleCopyPrompt() {
    navigator.clipboard.writeText(buildPlaceholderPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  }

  return (
    <TemplateGroupCard
      label="All Placeholders"
      subtitle="Every placeholder usable in this project — built-in, tag categories, links, and custom. Custom ones are edited below. Copy AI Prompt sends only Built-in + Tag Categories."
      initialCollapsed
      headerActions={
        <button type="button" className="button-secondary" onClick={handleCopyPrompt}>
          {copied ? 'Copied ✔️' : 'Copy AI Prompt'}
        </button>
      }
    >
      {REFERENCE_GROUPS.map(({ key, title }) => {
        const entries = reference[key];
        if (entries.length === 0) return null;
        return (
          <div key={key} className="placeholder-reference-group">
            <h4 className="tag-category">{title}</h4>
            <ul className="placeholder-reference-list">
              {entries.map((entry) => (
                <li key={entry.token}>
                  <code className="placeholder-reference-token">{entry.token}</code> — {entry.description}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </TemplateGroupCard>
  );
}

export default PlaceholderReference;
