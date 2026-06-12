import { useState } from 'react';

export default function LinksRegistryEditor({
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
}) {
  const [newKey, setNewKey] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const configLinks = projectConfig.description?.links || {};
  const overrideLinks = projectSettingsOverrides?.description?.links || {};
  const resolvedLinks = { ...configLinks, ...overrideLinks };

  function saveLink(key, url) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        links: { ...overrideLinks, [key]: url },
      },
    });
  }

  function removeLink(key) {
    const { [key]: _removed, ...remaining } = overrideLinks;
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        links: remaining,
      },
    });
  }

  function handleAdd() {
    const key = newKey.trim();
    const url = newUrl.trim();
    if (!key || !url) return;
    saveLink(key, url);
    setNewKey('');
    setNewUrl('');
  }

  return (
    <section className="tag-editor-section">
      <h3 className="tag-card-title">Links</h3>

      <div className="links-registry">
        {Object.entries(resolvedLinks).map(([key, url]) => {
          const isUserAdded = !(key in configLinks);
          const isOverridden = !isUserAdded && key in overrideLinks;

          return (
            <div key={key} className="links-registry-row">
              <span className="links-registry-key">{key}</span>
              <input
                className="form-input"
                defaultValue={url}
                onBlur={(e) => {
                  if (e.target.value !== url) saveLink(key, e.target.value);
                }}
              />
              {(isOverridden || isUserAdded) && (
                <button
                  type="button"
                  className="tag-reset-button"
                  title={isUserAdded ? 'Remove' : 'Reset to default'}
                  onClick={() => removeLink(key)}
                >
                  {isUserAdded ? '×' : '↺'}
                </button>
              )}
              {!isOverridden && !isUserAdded && (
                <span className="links-registry-spacer" />
              )}
            </div>
          );
        })}

        <div className="links-registry-row links-registry-row--add">
          <input
            className="form-input links-registry-key-input"
            placeholder="key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <button
            type="button"
            className="tag-reset-button"
            onClick={handleAdd}
            disabled={!newKey.trim() || !newUrl.trim()}
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}
