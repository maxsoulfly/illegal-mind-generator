import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsLinks from './ProjectSettingsLinks';
import ProjectSettingsBlocks from './ProjectSettingsBlocks';
import ProjectSettingsShortHooks from './ProjectSettingsShortHooks';
import ProjectSettingsTitles from './ProjectSettingsTitles';
import ProjectSettingsDescriptions from './ProjectSettingsDescriptions';
import ProjectSettingsThumbnails from './ProjectSettingsThumbnails';
import ProjectSettingsHashtags from './ProjectSettingsHashtags';

export default function ProjectSettingsContent({
  activeSection,
  projectId,
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
  hookTarget,
  openShortHooksSearch,
  titlesTarget,
  thumbnailsTarget,
  hashtagsTarget,
  blocksTarget,
  clearBlocksTarget,
  openBlocksEditor,
  otherProjects,
  syncHookTypesToProject,
  onOpenUIKit,
}) {
  if (activeSection === 'general') {
    return (
      <ProjectSettingsGeneral
        projectId={projectId}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        resetProjectOverride={resetProjectOverride}
        onOpenUIKit={onOpenUIKit}
      />
    );
  }

  if (activeSection === 'shortHooks') {
    return (
      <ProjectSettingsShortHooks
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        baseHookTypes={baseProjectConfig?.shortHookTypes || {}}
        otherProjects={otherProjects}
        syncHookTypesToProject={syncHookTypesToProject}
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

  if (activeSection === 'blocks') {
    return (
      <ProjectSettingsBlocks
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        blocksTarget={blocksTarget}
        clearBlocksTarget={clearBlocksTarget}
        openBlocksEditor={openBlocksEditor}
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
        openBlocksEditor={openBlocksEditor}
        openShortHooksSearch={openShortHooksSearch}
      />
    );
  }

  if (activeSection === 'thumbnails') {
    return (
      <ProjectSettingsThumbnails
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        thumbnailsTarget={thumbnailsTarget}
      />
    );
  }

  if (activeSection === 'hashtags') {
    return (
      <ProjectSettingsHashtags
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        hashtagsTarget={hashtagsTarget}
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
