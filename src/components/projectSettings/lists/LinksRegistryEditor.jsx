import { useState } from 'react';

export default function LinksRegistryEditor({
  baseProjectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
}) {
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const configLinks = baseProjectConfig.description?.links || {};
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

  const needle = search.trim().toLowerCase();
  const filteredLinks = Object.entries(resolvedLinks).filter(
    ([key, url]) => !needle || key.toLowerCase().includes(needle) || url.toLowerCase().includes(needle),
  );

  return (
    <section className="tag-editor-section">
      <input
        className="form-input links-registry-search"
        placeholder="Search keys or URLs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="links-registry">
        {filteredLinks.map(([key, url]) => {
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
              <button
                type="button"
                className="tag-reset-button"
                title={isUserAdded ? 'Remove' : 'Reset to default'}
                onClick={() => removeLink(key)}
                style={isOverridden || isUserAdded ? undefined : { visibility: 'hidden' }}
              >
                {isUserAdded ? '×' : '↺'}
              </button>
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
