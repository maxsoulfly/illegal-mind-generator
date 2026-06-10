import ShortHookCard from './ShortHookCard';


export default function ProjectSettingsShortHooks({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  hookTarget,
}) {
  const hookTypes = Object.entries(projectConfig.shortHookTypes || {});

  // Replaces the full templates array for one hook type in the override.
  // Other hook types are preserved by spreading the existing shortHookTypes override.
  function updateHookTypeTemplates(hookType, hookConfig, newTemplates) {
    updateProjectOverride({
      shortHookTypes: {
        ...(projectSettingsOverrides.shortHookTypes || {}),
        [hookType]: { ...hookConfig, templates: newTemplates },
      },
    });
  }

  // Removes the hook type key from the override entirely, so the base
  // project config templates are restored on next render.
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
            highlightText={hookTarget?.hookType === hookType ? hookTarget.sourceText : null}
          />
        ))}
      </div>
    </section>
  );
}
