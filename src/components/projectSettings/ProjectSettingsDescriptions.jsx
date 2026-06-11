import HookTemplateEditor from '../ui/HookTemplateEditor';

const LONG_GROUPS = [
  { key: 'introHook', label: 'Intro Hook' },
  { key: 'storyBlock', label: 'Story Block' },
  { key: 'philosophyLine', label: 'Philosophy Line' },
  { key: 'closingSignal', label: 'Closing Signal' },
];

const OVERRIDE_KEYS = LONG_GROUPS.map((g) => g.key);

export default function ProjectSettingsDescriptions({
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
    <>
      <h2 className="panel-title">Descriptions</h2>

      <div className="tag-library tag-library--3col">
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
    </>
  );
}
