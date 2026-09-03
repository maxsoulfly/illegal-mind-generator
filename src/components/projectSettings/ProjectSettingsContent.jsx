import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ShortHooks from './shortHooks/ShortHooks';
import Titles from './titles/Titles';
import DescriptionsWorkspace from './descriptions/DescriptionsWorkspace';
import ProjectSettingsThumbnails from './ProjectSettingsThumbnails';
import ProjectSettingsHashtags from './ProjectSettingsHashtags';
import WorkflowWorkspace from './workflow/WorkflowWorkspace';

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
  thumbnailsTarget,
  hashtagsTarget,
  blocksTarget,
  openBlocksEditor,
  descriptionsLeaf,
  otherProjects,
  syncHookTypesToProject,
  onOpenUIKit,
  showToast,
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
        showToast={showToast}
      />
    );
  }

  if (activeSection === 'shortHooks') {
    return (
      <ShortHooks
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
      <Titles
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        titlesTarget={titlesTarget}
      />
    );
  }

  if (activeSection === 'descriptions') {
    return (
      <DescriptionsWorkspace
        activeLeaf={descriptionsLeaf}
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        blocksTarget={blocksTarget}
        openBlocksEditor={openBlocksEditor}
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

  if (activeSection === 'workflow') {
    return (
      <WorkflowWorkspace
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
        resetProjectOverride={resetProjectOverride}
      />
    );
  }

  // Unreachable: ProjectSettingsPage's LEAF_TO_DISPATCH only ever yields one
  // of the ids handled above.
  return null;
}
