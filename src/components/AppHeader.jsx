import { useEffect, useRef, useState } from 'react';

const PAGE_LABELS = {
  generator:       'Generator',
  tags:            'Tag Library',
  shortsQueue:     'Shorts Queue',
  todo:            'Todo',
  projectSettings: 'Project Settings',
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
  const sentinelRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: [1] },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const pageLabel = activePage === 'uikit' ? 'UIKit' : PAGE_LABELS[activePage] ?? activePage;
  const title =
    activePage === 'uikit'
      ? pageLabel
      : `${pageLabel} — ${projectConfig.name}`;

  return (
    <>
      <div ref={sentinelRef} />
      <header className={`app-header${isStuck ? ' app-header--stuck' : ''}`}>
      <nav className="app-menu">
        <div className="app-menu-pages">
          {Object.entries(PAGE_LABELS).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={activePage === id ? 'active' : ''}
              onClick={() => setActivePage(id)}
            >
              {label}
            </button>
          ))}
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
    </>
  );
}
