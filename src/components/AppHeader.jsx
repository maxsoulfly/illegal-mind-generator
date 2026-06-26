const PAGE_LABELS = {
  generator:       'Generator',
  tags:            'Tag Library',
  shortsQueue:     'Shorts Queue',
  todo:            'Todo',
  projectSettings: 'Project Settings',
  uikit:           'UIKit',
};

export default function AppHeader({
  activePage,
  setActivePage,
  projectId,
  setProjectId,
  projects,
  projectConfig,
  actions,
}) {
  const pageLabel = PAGE_LABELS[activePage] ?? activePage;
  const title =
    activePage === 'uikit'
      ? pageLabel
      : `${pageLabel} — ${projectConfig.name}`;

  return (
    <header className="app-header">
      <nav className="app-menu">
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
          <button
            type="button"
            className={activePage === 'todo' ? 'active' : ''}
            onClick={() => setActivePage('todo')}
          >
            Todo
          </button>
          <button
            type="button"
            className={activePage === 'projectSettings' ? 'active' : ''}
            onClick={() => setActivePage('projectSettings')}
          >
            Project Settings
          </button>
          <button
            type="button"
            className={activePage === 'uikit' ? 'active' : ''}
            onClick={() => setActivePage('uikit')}
          >
            UIKit
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
                {id === projectId ? projectConfig.name : project.name}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <div className="app-header-title">
        <h1 className="app-title">{title}</h1>
        {actions && <div className="app-header-actions">{actions}</div>}
      </div>
    </header>
  );
}
