import ProjectTextField from '../ui/ProjectTextField';
import IconButton from '../ui/IconButton';
import AppBackupControls from '../AppBackupControls';

export default function ProjectSettingsGeneral({
  projectId,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
}) {
  const projectName =
    projectSettingsOverrides?.name ?? projectConfig.name ?? '';

  return (
    <section>
      <h2 className="panel-title">General</h2>

      <div className="tag-editor-section">
        <div className="form-row">
          <div className="form-group">
            <div className="form-label">Project ID</div>
            <input className="form-input" value={projectId} disabled readOnly />
          </div>

          <ProjectTextField
            label="Project Name"
            value={projectName}
            fieldName="name"
            onChange={updateProjectOverride}
            onReset={resetProjectOverride}
          />
        </div>
      </div>

      <div className="button-row">
        <IconButton icon="Duplicate Project" className="button-secondary" />
        <IconButton icon="Export Project Config" className="button-secondary" />
      </div>

      <p className="tag-summary">
        Project editing, duplication, and project-level import/export will be
        added here later.
      </p>

      <AppBackupControls />
    </section>
  );
}
