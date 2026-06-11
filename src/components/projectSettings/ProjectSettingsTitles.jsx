import HookTemplateEditor from './HookTemplateEditor';

const GROUP_LABELS = {
  standard: 'Standard',
  butIts: "But It's",
};

const GENERATION_SETTINGS_KEYS = [
  'prefix', 'longSuffix', 'shortsPrefix', 'shortsSuffix',
  'prefixEnabled', 'longSuffixEnabled', 'shortsPrefixEnabled', 'shortsSuffixEnabled',
  'connector', 'listSeparator', 'maxTransformationPhrases',
  'useHooksForLongTitles',
];

// Stores template overrides at projectSettingsOverrides.title.templates[groupName],
// which mergeProjectOverrides already knows how to shallow-merge per group.
export default function ProjectSettingsTitles({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const groups = Object.keys(projectConfig.title?.templates || {});
  const t = projectConfig.title || {};

  const prefix = t.prefix ?? t.longPrefix ?? '';
  const longSuffix = t.longSuffix ?? '';
  const shortsPrefix = t.shortsPrefix ?? '';
  const shortsSuffix = t.shortsSuffix ?? '';

  const prefixEnabled = t.prefixEnabled !== false;
  const longSuffixEnabled = t.longSuffixEnabled !== false;
  const shortsPrefixEnabled = t.shortsPrefixEnabled !== false;
  const shortsSuffixEnabled = t.shortsSuffixEnabled !== false;

  const connector = t.connector ?? '&';
  const listSeparator = t.listSeparator ?? ', ';
  const maxPhrases = t.maxTransformationPhrases ?? 1;
  const useHooksForLongTitles = t.useHooksForLongTitles ?? false;

  function updateTitleSetting(key, value) {
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        [key]: value,
      },
    });
  }

  function resetGenerationSettings() {
    const remaining = { ...(projectSettingsOverrides.title || {}) };
    GENERATION_SETTINGS_KEYS.forEach((k) => delete remaining[k]);
    updateProjectOverride({ title: remaining });
  }

  function updateGroupTemplates(groupName, newTemplates) {
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        templates: {
          ...(projectSettingsOverrides.title?.templates || {}),
          [groupName]: newTemplates,
        },
      },
    });
  }

  function resetGroup(groupName) {
    const { [groupName]: _removed, ...remaining } =
      projectSettingsOverrides.title?.templates || {};
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        templates: remaining,
      },
    });
  }

  return (
    <>
      <h2 className="panel-title">Titles</h2>

      <div className="tag-library tag-library--3col">
        <article className="tag-card">
          <header className="tag-card-header">
            <h3>Generation</h3>
            <button
              type="button"
              className="tag-reset-button"
              title="Reset to defaults"
              onClick={resetGenerationSettings}
            >
              ↺
            </button>
          </header>

          <div className="tag-phrase-row">
            <input
              type="checkbox"
              id="useHooksForLongTitles"
              checked={useHooksForLongTitles}
              onChange={(e) => updateTitleSetting('useHooksForLongTitles', e.target.checked)}
            />
            <label className="form-label" htmlFor="useHooksForLongTitles">
              Mix shorts hooks into long titles by default
            </label>
          </div>

          <details className="tag-editor-section">
            <summary className="tag-category">Prefix / Suffix</summary>

            <p className="tag-category">Long Titles</p>

            <div className="tag-phrase-row">
              <input
                type="checkbox"
                checked={prefixEnabled}
                onChange={(e) => updateTitleSetting('prefixEnabled', e.target.checked)}
              />
              <label className="form-label">Prefix</label>
              <input
                className="form-input"
                value={prefix}
                disabled={!prefixEnabled}
                placeholder="{num} available"
                onChange={(e) => updateTitleSetting('prefix', e.target.value)}
              />
            </div>

            <div className="tag-phrase-row">
              <input
                type="checkbox"
                checked={longSuffixEnabled}
                onChange={(e) => updateTitleSetting('longSuffixEnabled', e.target.checked)}
              />
              <label className="form-label">Suffix</label>
              <input
                className="form-input"
                value={longSuffix}
                disabled={!longSuffixEnabled}
                placeholder="e.g. // Illegal Mind Rework"
                onChange={(e) => updateTitleSetting('longSuffix', e.target.value)}
              />
            </div>

            <p className="tag-category">Shorts Titles</p>

            <div className="tag-phrase-row">
              <input
                type="checkbox"
                checked={shortsPrefixEnabled}
                onChange={(e) => updateTitleSetting('shortsPrefixEnabled', e.target.checked)}
              />
              <label className="form-label">Prefix</label>
              <input
                className="form-input"
                value={shortsPrefix}
                disabled={!shortsPrefixEnabled}
                placeholder="{num} available"
                onChange={(e) => updateTitleSetting('shortsPrefix', e.target.value)}
              />
            </div>

            <div className="tag-phrase-row">
              <input
                type="checkbox"
                checked={shortsSuffixEnabled}
                onChange={(e) => updateTitleSetting('shortsSuffixEnabled', e.target.checked)}
              />
              <label className="form-label">Suffix</label>
              <input
                className="form-input"
                value={shortsSuffix}
                disabled={!shortsSuffixEnabled}
                placeholder="{num} available"
                onChange={(e) => updateTitleSetting('shortsSuffix', e.target.value)}
              />
            </div>
          </details>

          <details className="tag-editor-section">
            <summary className="tag-category">Transformation</summary>

            <div className="tag-phrase-row">
              <label className="form-label">List separator</label>
              <input
                className="form-input"
                value={listSeparator}
                onChange={(e) => updateTitleSetting('listSeparator', e.target.value)}
              />
            </div>

            <div className="tag-phrase-row">
              <label className="form-label">Connector</label>
              <input
                className="form-input"
                value={connector}
                onChange={(e) => updateTitleSetting('connector', e.target.value)}
              />
            </div>

            <div className="tag-phrase-row">
              <label className="form-label">Max phrases</label>
              <input
                type="range"
                min={1}
                max={4}
                value={maxPhrases}
                onChange={(e) =>
                  updateTitleSetting('maxTransformationPhrases', Number(e.target.value))
                }
              />
              <span className="tag-status">{maxPhrases}</span>
            </div>
          </details>
        </article>

        {groups.map((groupName) => {
          const templates = projectConfig.title.templates[groupName] || [];
          const label = GROUP_LABELS[groupName] || groupName;

          return (
            <article key={groupName} className="tag-card">
              <header className="tag-card-header">
                <h3>{label}</h3>
                <button
                  type="button"
                  className="tag-reset-button"
                  title="Reset to defaults"
                  onClick={() => resetGroup(groupName)}
                >
                  ↺
                </button>
                <span className="tag-status">{templates.length} templates</span>
              </header>

              <HookTemplateEditor
                templates={templates}
                onUpdateTemplates={(newTemplates) =>
                  updateGroupTemplates(groupName, newTemplates)
                }
              />
            </article>
          );
        })}
      </div>
    </>
  );
}
