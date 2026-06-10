import { useState } from 'react';

// Edits persist immediately via onUpdateTemplates, which replaces the full
// templates array for this hook type in the project override storage.
// onReset removes the override entirely, restoring the base project config.
export default function ShortHookCard({ hookType, hookConfig, onUpdateTemplates, onReset }) {
  // null = bulk textarea closed; any string (including '') = open
  const [bulkValue, setBulkValue] = useState(null);

  const phraseCount = hookConfig.templates?.length || 0;

  function applyBulk() {
    const newLines = (bulkValue || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!newLines.length) return;

    onUpdateTemplates([...(hookConfig.templates || []), ...newLines]);
    setBulkValue(null);
  }

  return (
    <article className="tag-card">
      <header className="tag-card-header">
        <h3>{hookConfig.label}</h3>

        <button
          type="button"
          className="tag-reset-button"
          title="Reset hook group"
          onClick={onReset}
        >
          ↺
        </button>

        <span className="tag-status">{phraseCount} phrases</span>
      </header>

      <p className="tag-category">{hookType}</p>

      <details className="tag-section">
        <summary>Edit hooks</summary>

        {(hookConfig.templates || []).map((template, i) => (
          <div key={i} className="tag-phrase-row">
            <input
              className="form-input"
              value={template}
              onChange={(e) => {
                const next = [...(hookConfig.templates || [])];
                next[i] = e.target.value;
                onUpdateTemplates(next);
              }}
            />

            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                onUpdateTemplates(hookConfig.templates.filter((_, idx) => idx !== i))
              }
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
            onClick={() => onUpdateTemplates([...(hookConfig.templates || []), ''])}
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
    </article>
  );
}
