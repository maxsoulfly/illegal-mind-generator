import { useState } from 'react';

import FormField from '../ui/FormField';

export default function TagPhraseEditor({
  title,
  tagName,
  field,
  parentField,
  parentValue = {},
  phrases = [],
  onUpdateTag,
  autoOpen = false,
}) {
  // null = bulk textarea closed; any string (including '') = open
  const [bulkValue, setBulkValue] = useState(null);

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
    <details className="tag-editor-section" open={autoOpen}>
      <summary>
        {title} ({phrases.length})
      </summary>

      <div className="tag-phrase-editor">
        <FormField>
          {phrases.map((phrase, index) => (
            <div className="tag-phrase-row" key={index}>
              <input
                key={`${tagName}-${field}-${index}-${phrase}`}
                className="form-input"
                defaultValue={phrase}
                onBlur={(e) => updatePhrase(index, e.target.value)}
              />

              <button
                type="button"
                className="button-secondary"
                onClick={() => removePhrase(index)}
              >
                ✕
              </button>
            </div>
          ))}

          {bulkValue != null && (
            <div className="tag-section">
              <textarea
                className="form-input"
                rows={4}
                placeholder="One phrase per line"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
              />

              <div className="button-row">
                <button type="button" className="button-secondary" onClick={applyBulk}>
                  Apply
                </button>

                <button type="button" className="button-secondary" onClick={() => setBulkValue(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="button-row">
            <button type="button" className="button-secondary" onClick={addPhrase}>
              + Add
            </button>

            <button type="button" className="button-secondary" onClick={() => setBulkValue('')}>
              + Bulk
            </button>
          </div>
        </FormField>
      </div>
    </details>
  );
}
