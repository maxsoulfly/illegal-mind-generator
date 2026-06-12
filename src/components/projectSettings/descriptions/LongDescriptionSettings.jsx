import HookTemplateEditor from '../../ui/HookTemplateEditor';

const LONG_GROUPS = [
  { key: 'introHook', label: 'Intro Hook' },
  { key: 'storyBlock', label: 'Story Block' },
  { key: 'philosophyLine', label: 'Philosophy Line' },
  { key: 'closingSignal', label: 'Closing Signal' },
];

export default function LongDescriptionSettings({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const longTemplates = projectConfig.description?.templates?.long || {};

  function updateLongTemplates(key, newTemplates) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          long: {
            ...(projectSettingsOverrides.description?.templates?.long || {}),
            [key]: newTemplates,
          },
        },
      },
    });
  }

  function resetLongGroup(key) {
    const { [key]: _removed, ...remaining } =
      projectSettingsOverrides.description?.templates?.long || {};
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          long: remaining,
        },
      },
    });
  }

  return (
    <div className="desc-layout">
      <aside className="desc-layout-available">
        <h3>Available</h3>
        <p className="tag-summary">Unused blocks will appear here.</p>
      </aside>

      <div className="desc-layout-active">
        {LONG_GROUPS.map(({ key, label }) => {
          const templates = longTemplates[key] || [];

          return (
            <article key={key} className="tag-card">
              <header className="tag-card-header">
                <h3>{label}</h3>
                <button
                  type="button"
                  className="tag-reset-button"
                  title="Reset to defaults"
                  onClick={() => resetLongGroup(key)}
                >
                  ↺
                </button>
                <span className="tag-status">{templates.length} templates</span>
              </header>

              <HookTemplateEditor
                templates={templates}
                onUpdateTemplates={(newTemplates) => updateLongTemplates(key, newTemplates)}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
