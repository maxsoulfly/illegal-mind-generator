import ProjectSettingsShortsQueue from '../ProjectSettingsShortsQueue';
import ProjectSettingsTodo from '../ProjectSettingsTodo';
import ProjectSettingsUploadSchedule from '../ProjectSettingsUploadSchedule';

// Stage 5 of the Content Setup IA rework: Workflow is one page — the three
// planning-page configs (Shorts Queue, Todo Statuses, Upload Schedule)
// stacked. Each child is its existing <section> component, unchanged; this
// just drops the redundant leaf sub-strip they used to sit behind.
export default function WorkflowWorkspace({
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
}) {
  return (
    <>
      <ProjectSettingsShortsQueue
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />
      <ProjectSettingsTodo
        projectConfig={projectConfig}
        updateProjectOverride={updateProjectOverride}
        resetProjectOverride={resetProjectOverride}
      />
      <ProjectSettingsUploadSchedule
        projectConfig={projectConfig}
        updateProjectOverride={updateProjectOverride}
        resetProjectOverride={resetProjectOverride}
      />
    </>
  );
}
