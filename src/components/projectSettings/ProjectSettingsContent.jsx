import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsShortHooks from './ProjectSettingsShortHooks';

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
    return <ProjectSettingsShortHooks projectConfig={projectConfig} />;
  }

  return (
    <>
      <h2 className="panel-title">Coming Soon</h2>
      <p className="tag-summary">This section will be added later.</p>
    </>
  );
}
