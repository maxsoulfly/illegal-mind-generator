import { useState } from 'react';

// Collapsible editor for a single hook type's templates array.
// All mutations call onUpdateTemplates with the full replacement array —
// the parent (ShortHookCard) is responsible for persisting it.
export default function HookTemplateEditor({ templates = [], onUpdateTemplates }) {
  // null = bulk textarea closed; any string (including '') = open
  const [bulkValue, setBulkValue] = useState(null);

  function applyBulk() {
    const newLines = (bulkValue || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!newLines.length) return;

    onUpdateTemplates([...templates, ...newLines]);
    setBulkValue(null);
  }

  return (
    <details className="tag-section">
      <summary>Edit hooks</summary>

      {templates.map((template, i) => (
        <div key={i} className="tag-phrase-row">
          <input
            className="form-input"
            value={template}
            onChange={(e) => {
              const next = [...templates];
              next[i] = e.target.value;
              onUpdateTemplates(next);
            }}
          />

          <button
            type="button"
            className="button-secondary"
            onClick={() => onUpdateTemplates(templates.filter((_, idx) => idx !== i))}
          >
            ×
          </button>
        </div>
      ))}

      {bulkValue != null && (
        <div className="tag-section">
          <textarea
            className="form-input"
            rows={4}
            placeholder="One template per line"
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
          />

          <div className="button-row">
            <button type="button" className="button-secondary" onClick={applyBulk}>
              Apply
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => setBulkValue(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="button-row">
        <button
          type="button"
          className="button-secondary"
          onClick={() => onUpdateTemplates([...templates, ''])}
        >
          + Add
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={() => setBulkValue('')}
        >
          + Bulk
        </button>
      </div>
    </details>
  );
}
