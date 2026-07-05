import { useEffect, useRef, useState } from 'react';

import AddBulkRow from './AddBulkRow';
import BulkTextarea from './BulkTextarea';
import PhraseRow from './PhraseRow';
import { HOOK_PLACEHOLDERS } from '../../utils/hookPlaceholders';

// Collapsible editor for a single hook type's templates array.
// All mutations call onUpdateTemplates with the full replacement array —
// the parent (ShortHookCard) is responsible for persisting it.
export default function HookTemplateEditor({ templates = [], onUpdateTemplates, highlightText, noWrapper = false, placeholders = HOOK_PLACEHOLDERS }) {
  // null = bulk textarea closed; any string (including '') = open
  const [bulkValue, setBulkValue] = useState(null);
  const [searchText, setSearchText] = useState('');
  const detailsRef = useRef(null);
  const highlightRowRef = useRef(null);

  // When a hook button in the generator navigates here, auto-open the
  // details panel, prefill the search box so long template lists collapse
  // down to just the matching row, and scroll it into view.
  useEffect(() => {
    if (!highlightText) return;
    if (detailsRef.current) detailsRef.current.open = true;
    setSearchText(highlightText);
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

  const inner = (
    <>
      <input
        className="form-input"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {visibleTemplates.map(({ template, index }) => {
        const isHighlighted = template === highlightText;
        return (
          <PhraseRow
            key={index}
            ref={isHighlighted ? highlightRowRef : null}
            highlighted={isHighlighted}
            value={template}
            placeholders={placeholders}
            onCommit={(newValue) => {
              const next = [...templates];
              next[index] = newValue;
              onUpdateTemplates(next);
            }}
            onRemove={() => onUpdateTemplates(templates.filter((_, idx) => idx !== index))}
          />
        );
      })}

      {bulkValue != null && (
        <BulkTextarea
          value={bulkValue}
          onChange={setBulkValue}
          onApply={applyBulk}
          onCancel={() => setBulkValue(null)}
          placeholders={placeholders}
        />
      )}

      <AddBulkRow
        onAdd={() => onUpdateTemplates([...templates, ''])}
        onBulk={() => setBulkValue('')}
      />
    </>
  );

  if (noWrapper) return inner;

  return (
    <details className="tag-section" ref={detailsRef}>
      <summary>Edit hooks</summary>
      {inner}
    </details>
  );
}
