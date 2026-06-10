import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsShortHooks from './ProjectSettingsShortHooks';
import ProjectSettingsTitles from './ProjectSettingsTitles';
import ProjectSettingsDescriptions from './ProjectSettingsDescriptions';

export default function ProjectSettingsContent({
  activeSection,
  projectId,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
  hookTarget,
}) {
  if (activeSection === 'general') {
    return (
      <ProjectSettingsGeneral
        projectId={projectId}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        resetProjectOverride={resetProjectOverride}
      />
    );
  }

  if (activeSection === 'shortHooks') {
    return (
      <ProjectSettingsShortHooks
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        hookTarget={hookTarget}
      />
    );
  }
  if (activeSection === 'titles') {
    return (
      <ProjectSettingsTitles
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />
    );
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
