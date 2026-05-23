import AppBackupControls from './AppBackupControls';

export default function AppMenu({
  activePage,
  setActivePage,
  projectId,
  setProjectId,
  projects,
}) {
  return (
    <nav className="app-menu">

      {/* TODO: Add refactor buttons */}
      <div className="app-menu-pages">
        <button
          type="button"
          className={activePage === 'generator' ? 'active' : ''}
          onClick={() => setActivePage('generator')}
        >
          Generator
        </button>

        <button
          type="button"
          className={activePage === 'tags' ? 'active' : ''}
          onClick={() => setActivePage('tags')}
        >
          Tag Library
        </button>

        <button
          type="button"
          className={activePage === 'shortsQueue' ? 'active' : ''}
          onClick={() => setActivePage('shortsQueue')}
        >
          Shorts Queue
        </button>
      </div>

      <div className="app-menu-project">
        <label>Project</label>
        <select
          className="form-select"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          {Object.entries(projects).map(([id, project]) => (
            <option key={id} value={id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <AppBackupControls />
    </nav>
  );
}
