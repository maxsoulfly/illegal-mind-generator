export default function ProjectSettingsGeneral({ projectId, projectConfig }) {
  return (
    <>
      <h2 className="panel-title">General</h2>

      <div className="tag-edit-fields">
        <label>
          Project Name
          <input className="form-input" value={projectConfig.name} readOnly />
        </label>

        <label>
          Project ID
          <input className="form-input" value={projectId} readOnly />
        </label>
      </div>

      <div className="tag-section">
        <h3 className="tag-summary">Project management</h3>

        <div className="button-row">
          <button type="button" className="button-secondary" disabled>
            Duplicate Project
          </button>

          <button type="button" className="button-secondary" disabled>
            Export Project Config
          </button>
        </div>

        <p className="tag-summary">
          Project editing, duplication, and project-level import/export will be
          added here later.
        </p>
      </div>
    </>
  );
}
