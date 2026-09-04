import { useEffect, useRef, useState } from 'react';

import AddBulkRow from '../ui/AddBulkRow';
import BulkTextarea from '../ui/BulkTextarea';
import FormField from '../ui/FormField';
import PhraseRow from '../ui/PhraseRow';
import { clearOnEscape } from '../../utils/keyboard';

export default function TagPhraseEditor({
  title,
  tagName,
  field,
  parentField,
  parentValue = {},
  phrases = [],
  onUpdateTag,
  autoOpen = false,
  highlightText = null,
  placeholders,
  // Skip the <details>/<summary> collapse wrapper — the caller already
  // provides its own collapsible shell (e.g. CoverShortHooksEditor, whose
  // ToggleButton owns the open/close + count). Same escape hatch
  // HookTemplateEditor's `noWrapper` gives for the Hook Blocks tab.
  noWrapper = false,
  // Show a search box above the list that filters which rows render (by
  // real index, so edit/remove still target the right entry). Used by
  // CoverShortHooksEditor.
  searchable = false,
  // Extra control rendered in the + Add / + Bulk row (CoverShortHooksEditor
  // puts its "Copy AI Prompt" button here).
  actionsSlot = null,
}) {
  // null = bulk textarea closed; any string (including '') = open
  const [bulkValue, setBulkValue] = useState(null);
  const [search, setSearch] = useState('');
  const detailsRef = useRef(null);
  const highlightRowRef = useRef(null);

  // When navigating here from the generator, auto-open and scroll to the matching phrase.
  useEffect(() => {
    if (!highlightText) return;
    if (detailsRef.current) detailsRef.current.open = true;
    if (highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightText]);

  const buildUpdate = (nextPhrases) => {
    if (!parentField) {
      return { [field]: nextPhrases };
    }

    return {
      [parentField]: {
        ...parentValue,
        [field]: nextPhrases,
      },
    };
  };

  const updatePhrase = (index, value) => {
    const nextPhrases = phrases.map((phrase, i) => (i === index ? value : phrase));
    onUpdateTag(tagName, buildUpdate(nextPhrases));
  };

  const addPhrase = () => {
    onUpdateTag(tagName, buildUpdate([...phrases, '']));
  };

  const applyBulk = () => {
    const newPhrases = (bulkValue || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (newPhrases.length === 0) return;

    onUpdateTag(tagName, buildUpdate([...phrases, ...newPhrases]));
    setBulkValue(null);
  };

  const removePhrase = (index) => {
    onUpdateTag(tagName, buildUpdate(phrases.filter((_, i) => i !== index)));
  };

  const normalizedSearch = searchable ? search.trim().toLowerCase() : '';

  const body = (
    <div className="tag-phrase-editor">
      {searchable && (
        <input
          className="form-input"
          type="search"
          placeholder="Search hooks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={clearOnEscape(search, () => setSearch(''))}
        />
      )}

      <FormField>
        <div className="phrase-row-list">
          {phrases.map((phrase, index) => {
            if (normalizedSearch && !phrase.toLowerCase().includes(normalizedSearch)) return null;
            const isHighlighted = phrase === highlightText;
            return (
              <PhraseRow
                key={index}
                ref={isHighlighted ? highlightRowRef : null}
                highlighted={isHighlighted}
                value={phrase}
                placeholders={placeholders}
                commitOnEnter
                cancelBlankOnEscape
                onCommit={(newValue) => updatePhrase(index, newValue)}
                onRemove={() => removePhrase(index)}
              />
            );
          })}
        </div>

        {bulkValue != null && (
          <BulkTextarea
            value={bulkValue}
            onChange={setBulkValue}
            onApply={applyBulk}
            onCancel={() => setBulkValue(null)}
            placeholders={placeholders}
          />
        )}

        <AddBulkRow onAdd={addPhrase} onBulk={() => setBulkValue('')} extra={actionsSlot} />
      </FormField>
    </div>
  );

  if (noWrapper) return body;

  return (
    <details className="tag-editor-section" ref={detailsRef} open={autoOpen}>
      <summary>
        {title} ({phrases.length})
      </summary>

      {body}
    </details>
  );
}
