import { useEffect, useRef, useState } from 'react';

import AddBulkRow from '../ui/AddBulkRow';
import BulkTextarea from '../ui/BulkTextarea';
import FormField from '../ui/FormField';
import PhraseRow from '../ui/PhraseRow';

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
}) {
  // null = bulk textarea closed; any string (including '') = open
  const [bulkValue, setBulkValue] = useState(null);
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

  return (
    <details className="tag-editor-section" ref={detailsRef} open={autoOpen}>
      <summary>
        {title} ({phrases.length})
      </summary>

      <div className="tag-phrase-editor">
        <FormField>
          {phrases.map((phrase, index) => {
            const isHighlighted = phrase === highlightText;
            return (
              <PhraseRow
                key={index}
                ref={isHighlighted ? highlightRowRef : null}
                highlighted={isHighlighted}
                value={phrase}
                placeholders={placeholders}
                onCommit={(newValue) => updatePhrase(index, newValue)}
                onRemove={() => removePhrase(index)}
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

          <AddBulkRow onAdd={addPhrase} onBulk={() => setBulkValue('')} />
        </FormField>
      </div>
    </details>
  );
}
