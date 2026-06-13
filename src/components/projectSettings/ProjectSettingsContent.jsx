import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsLinks from './ProjectSettingsLinks';
import ProjectSettingsLists from './ProjectSettingsLists';
import ProjectSettingsShortHooks from './ProjectSettingsShortHooks';
import ProjectSettingsTitles from './ProjectSettingsTitles';
import ProjectSettingsDescriptions from './ProjectSettingsDescriptions';

export default function ProjectSettingsContent({
  activeSection,
  projectId,
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
  hookTarget,
  titlesTarget,
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
        titlesTarget={titlesTarget}
      />
    );
  }

  if (activeSection === 'links') {
    return (
      <ProjectSettingsLinks
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />
    );
  }

  if (activeSection === 'lists') {
    return (
      <ProjectSettingsLists
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />
    );
  }

  if (activeSection === 'descriptions') {
    return (
      <ProjectSettingsDescriptions
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />
    );
  }

  return (
    <>
      <h2 className="panel-title">Coming Soon</h2>
      <p className="tag-summary">This section will be added later.</p>
    </>
  );
}
