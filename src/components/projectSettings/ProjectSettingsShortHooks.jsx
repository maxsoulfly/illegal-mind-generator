import ShortHookCard from './ShortHookCard';

export default function ProjectSettingsShortHooks({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const hookTypes = Object.entries(projectConfig.shortHookTypes || {});

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

  return (
    <section>
      <h2 className="panel-title">Shorts Hooks</h2>

      <div className="tag-library">
        {hookTypes.map(([hookType, hookConfig]) => (
          <ShortHookCard
            key={hookType}
            hookType={hookType}
            hookConfig={hookConfig}
            onUpdateTemplates={(newTemplates) =>
              updateHookTypeTemplates(hookType, hookConfig, newTemplates)
            }
            onReset={() => resetHookType(hookType)}
          />
        ))}
      </div>
    </section>
  );
}
