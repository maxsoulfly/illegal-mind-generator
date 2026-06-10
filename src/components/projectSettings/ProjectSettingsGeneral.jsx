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
        <div className="form-group">
          <div className="form-label">Project ID</div>
          <div className="terminal-block">{projectId}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Project Name</div>

          <div className="tag-phrase-row">
            <input
              className="form-input"
              value={projectName}
              onChange={(e) =>
                updateProjectOverride({
                  name: e.target.value,
                })
              }
            />

            <button
              type="button"
              className="button-secondary"
              onClick={() => resetProjectOverride('name')}
              disabled={!projectSettingsOverrides?.name}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="button-row">
        <button type="button" className="button-secondary">
          Duplicate Project
        </button>

        <button type="button" className="button-secondary">
          Export Project Config
        </button>
      </div>

      <p className="tag-summary">
        Project editing, duplication, and project-level import/export will be
        added here later.
      </p>
    </section>
  );
}
