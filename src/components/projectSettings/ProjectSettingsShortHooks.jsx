import { useState } from 'react';

export default function ProjectSettingsShortHooks({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const hookTypes = Object.entries(projectConfig.shortHookTypes || {});
  const [bulkInputs, setBulkInputs] = useState({});

  function updateHookTypeTemplates(hookType, hookConfig, newTemplates) {
    updateProjectOverride({
      shortHookTypes: {
        ...(projectSettingsOverrides.shortHookTypes || {}),
        [hookType]: { ...hookConfig, templates: newTemplates },
      },
    });
  }

  function resetHookType(hookType) {
    const { [hookType]: _removed, ...remaining } =
      projectSettingsOverrides.shortHookTypes || {};
    updateProjectOverride({ shortHookTypes: remaining });
  }

  function applyBulk(hookType, hookConfig) {
    const raw = bulkInputs[hookType] || '';
    const newLines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!newLines.length) return;

    updateHookTypeTemplates(hookType, hookConfig, [
      ...(hookConfig.templates || []),
      ...newLines,
    ]);
    setBulkInputs((prev) => ({ ...prev, [hookType]: null }));
  }

  return (
    <section>
      <h2 className="panel-title">Shorts Hooks</h2>

      <div className="tag-library">
        {hookTypes.map(([hookType, hookConfig]) => {
          const phraseCount = hookConfig.templates?.length || 0;
          const isBulkOpen = bulkInputs[hookType] != null;

          return (
            <article key={hookType} className="tag-card">
              <header className="tag-card-header">
                <h3>{hookConfig.label}</h3>

                <button
                  type="button"
                  className="tag-reset-button"
                  title="Reset hook group"
                  onClick={() => resetHookType(hookType)}
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
                        const newTemplates = [...(hookConfig.templates || [])];
                        newTemplates[i] = e.target.value;
                        updateHookTypeTemplates(hookType, hookConfig, newTemplates);
                      }}
                    />

                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        const newTemplates = hookConfig.templates.filter(
                          (_, idx) => idx !== i,
                        );
                        updateHookTypeTemplates(hookType, hookConfig, newTemplates);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {isBulkOpen && (
                  <div className="tag-section">
                    <textarea
                      className="form-input"
                      rows={4}
                      placeholder="One template per line"
                      value={bulkInputs[hookType]}
                      onChange={(e) =>
                        setBulkInputs((prev) => ({
                          ...prev,
                          [hookType]: e.target.value,
                        }))
                      }
                    />

                    <div className="button-row">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => applyBulk(hookType, hookConfig)}
                      >
                        Apply
                      </button>

                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() =>
                          setBulkInputs((prev) => ({ ...prev, [hookType]: null }))
                        }
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
                    onClick={() => {
                      const newTemplates = [...(hookConfig.templates || []), ''];
                      updateHookTypeTemplates(hookType, hookConfig, newTemplates);
                    }}
                  >
                    + Add
                  </button>

                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      setBulkInputs((prev) => ({ ...prev, [hookType]: '' }))
                    }
                  >
                    + Bulk
                  </button>
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}
