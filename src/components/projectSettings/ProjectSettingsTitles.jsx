import HookTemplateEditor from './HookTemplateEditor';

const GROUP_LABELS = {
  standard: 'Standard',
  butIts: "But It's",
};

// Stores template overrides at projectSettingsOverrides.title.templates[groupName],
// which mergeProjectOverrides already knows how to shallow-merge per group.
export default function ProjectSettingsTitles({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const groups = Object.keys(projectConfig.title?.templates || {});

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
