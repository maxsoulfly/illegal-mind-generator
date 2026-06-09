import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsShortHooks from './ProjectSettingsShortHooks';
import ProjectSettingsTitles from './ProjectSettingsTitles';
import ProjectSettingsDescriptions from './ProjectSettingsDescriptions';

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
  if (activeSection === 'titles') {
    return <ProjectSettingsTitles projectConfig={projectConfig} />;
  }

  if (activeSection === 'descriptions') {
    return <ProjectSettingsDescriptions />;
  }

  return (
    <>
      <h2 className="panel-title">Coming Soon</h2>
      <p className="tag-summary">This section will be added later.</p>
    </>
  );
}
