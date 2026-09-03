import ProjectTextField from '../ui/ProjectTextField';
import IconButton from '../ui/IconButton';
import TemplateGroupCard from '../ui/TemplateGroupCard';
import AppBackupControls from '../AppBackupControls';

export default function ProjectSettingsProject({
  projectId,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
  onOpenUIKit,
  showToast,
}) {
  const projectName =
    projectSettingsOverrides?.name ?? projectConfig.name ?? '';

  return (
    <section>
      <h2 className="panel-title">Project</h2>

      <div className="tag-library tag-library--3col">
        <TemplateGroupCard label="Project Info">
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Project ID</div>
              <input
                className="form-input"
                value={projectId}
                disabled
                readOnly
              />
            </div>
          </div>
          <div className="form-row">
            <ProjectTextField
              label="Project Name"
              value={projectName}
              fieldName="name"
              onChange={updateProjectOverride}
              onReset={resetProjectOverride}
            />
          </div>
        </TemplateGroupCard>

        <TemplateGroupCard label="Actions">
          <div className="button-row">
            <IconButton
              icon="Open UIKit →"
              className="button-secondary"
              onClick={onOpenUIKit}
            />
          </div>
        </TemplateGroupCard>

        <TemplateGroupCard
          label="Backup"
          subtitle="App-wide — every project, plus all saved entries, tags, and queues. Not scoped to this project."
        >
          <AppBackupControls showToast={showToast} />
        </TemplateGroupCard>
      </div>
    </section>
  );
}
