import ProjectSettingsGeneral from './ProjectSettingsGeneral';

export default function ProjectSettingsContent({
  activeSection,
  projectId,
  projectConfig,
}) {
  if (activeSection === 'general') {
    return (
      <ProjectSettingsGeneral
        projectId={projectId}
        projectConfig={projectConfig}
      />
    );
  }

  if (activeSection === 'shortHooks') {
    return (
      <>
        <h2 className="panel-title">Shorts Hooks</h2>
        <p className="tag-summary">Shorts hook editor will be added here.</p>
      </>
    );
  }

  return (
    <>
      <h2 className="panel-title">Coming Soon</h2>
      <p className="tag-summary">This section will be added later.</p>
    </>
  );
}
