import ProjectSettingsShortsQueue from '../ProjectSettingsShortsQueue';
import ProjectSettingsTodo from '../ProjectSettingsTodo';
import ProjectSettingsUploadSchedule from '../ProjectSettingsUploadSchedule';

// Stage 5 of the Content Setup IA rework: Workflow is one workspace with a
// single page heading, presenting the three planning configs as coherent
// sub-section cards. Each child renders in `embedded` mode (no standalone
// <section>/<h2>/grid wrapper — this component owns the hierarchy). Desktop
// layout: Shorts Queue + Todo Statuses side by side, Upload Schedule full
// width below (.workflow-grid); stacks vertically on narrow widths. Editor
// logic and write paths are unchanged.
export default function WorkflowWorkspace({
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
}) {
  return (
    <section>
      <h2 className="panel-title">Workflow</h2>

      <div className="workflow-grid">
        <ProjectSettingsShortsQueue
          embedded
          heading="Shorts Queue"
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
        />
        <ProjectSettingsTodo
          embedded
          heading="Todo Statuses"
          projectConfig={projectConfig}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
        />
        <ProjectSettingsUploadSchedule
          embedded
          heading="Upload Schedule"
          projectConfig={projectConfig}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
        />
      </div>
    </section>
  );
}
