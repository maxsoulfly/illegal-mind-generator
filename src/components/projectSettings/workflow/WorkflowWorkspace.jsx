import ProjectSettingsShortsQueue from '../ProjectSettingsShortsQueue';
import ProjectSettingsTodo from '../ProjectSettingsTodo';
import ProjectSettingsUploadSchedule from '../ProjectSettingsUploadSchedule';

// Stage 5 of the Content Setup IA rework: Workflow is one workspace with a
// single page heading, presenting the three planning configs as coherent
// sub-section cards. Each child renders just its card (this component owns
// the <section>/<h2>/grid hierarchy) and takes `heading` for its card
// label. Desktop layout: Shorts Queue + Todo Statuses side by side, Upload
// Schedule full width below (.workflow-grid); stacks vertically on narrow
// widths. Editor logic and write paths are unchanged.
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
          heading="Shorts Queue"
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
        />
        <ProjectSettingsTodo
          heading="Todo Statuses"
          projectConfig={projectConfig}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
        />
        <ProjectSettingsUploadSchedule
          heading="Upload Schedule"
          projectConfig={projectConfig}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
        />
      </div>
    </section>
  );
}
