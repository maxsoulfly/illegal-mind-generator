export default function ProjectSettingsShortHooks({ projectConfig }) {
  const hookTypes = Object.entries(projectConfig.shortHookTypes || {});

  return (
    <>
      <h2 className="panel-title">Shorts Hooks</h2>

      {hookTypes.map(([hookType, hookConfig]) => (
        <section key={hookType} className="tag-section">
          <h3 className="tag-summary">{hookConfig.label}</h3>
          <p className="tag-summary">
            {hookConfig.templates?.length || 0} preset phrases
          </p>
        </section>
      ))}
    </>
  );
}
