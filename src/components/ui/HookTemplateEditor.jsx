import { useEffect, useRef, useState } from 'react';

import AddBulkRow from './AddBulkRow';
import BulkTextarea from './BulkTextarea';
import PhraseRow from './PhraseRow';

// Collapsible editor for a single hook type's templates array.
// All mutations call onUpdateTemplates with the full replacement array —
// the parent (ShortHookCard) is responsible for persisting it.
export default function HookTemplateEditor({ templates = [], onUpdateTemplates, highlightText }) {
  // null = bulk textarea closed; any string (including '') = open
  const [bulkValue, setBulkValue] = useState(null);
  const [searchText, setSearchText] = useState('');
  const detailsRef = useRef(null);
  const highlightRowRef = useRef(null);

  // When a hook button in the generator navigates here, auto-open the
  // details panel and scroll the matching template row into view.
  useEffect(() => {
    if (!highlightText) return;
    if (detailsRef.current) detailsRef.current.open = true;
    if (highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightText]);

  function applyBulk() {
    const newLines = (bulkValue || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!newLines.length) return;

    onUpdateTemplates([...templates, ...newLines]);
    setBulkValue(null);
  }

  // Keep original index so edits and deletes target the right entry even when filtered.
  const visibleTemplates = templates
    .map((template, index) => ({ template, index }))
    .filter(({ template }) =>
      template.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <details className="tag-section" ref={detailsRef}>
      <summary>Edit hooks</summary>

      <input
        className="form-input"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {visibleTemplates.map(({ template, index }) => {
        const isHighlighted = template === highlightText;
        return (
          <div
            key={index}
            ref={isHighlighted ? highlightRowRef : null}
            className={isHighlighted ? 'tag-phrase-row--highlight' : undefined}
          >
            <PhraseRow
              value={template}
              onCommit={(newValue) => {
                const next = [...templates];
                next[index] = newValue;
                onUpdateTemplates(next);
              }}
              onRemove={() => onUpdateTemplates(templates.filter((_, idx) => idx !== index))}
            />
          </div>
        );
      })}

      {bulkValue != null && (
        <BulkTextarea
          value={bulkValue}
          onChange={setBulkValue}
          onApply={applyBulk}
          onCancel={() => setBulkValue(null)}
        />
      )}

      <AddBulkRow
        onAdd={() => onUpdateTemplates([...templates, ''])}
        onBulk={() => setBulkValue('')}
      />
    </details>
  );
}
