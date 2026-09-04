import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { ROUTES } from '../config/routes';

// Order = display order. Workflow pages first, then the two authoring
// workspaces (Tag Library = tag-level, Content Setup = project-level).
// `projectSettings` keeps its internal id — only the label changed (see
// contentSetupNav.js / the Content Setup IA rework). `uikit` (nav: false in
// routes.js) is deliberately excluded from this list — it's a real,
// refresh-safe route, just not a top-nav tab (reachable only via the "Open
// UIKit" button — see Content Setup's Project tab).
const NAV_ITEMS = ROUTES.filter((route) => route.nav);

// activePage -> label, incl. the one nav-hidden route (uikit) for the <h1>
// title, which isn't covered by NAV_ITEMS.
const PAGE_LABELS = Object.fromEntries(ROUTES.map((route) => [route.id, route.label]));

export default function AppHeader({
  activePage,
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

  const pageLabel = PAGE_LABELS[activePage] ?? activePage;
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
          {NAV_ITEMS.map(({ id, path, label }) => (
            <NavLink
              key={id}
              to={path}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => window.scrollTo(0, 0)}
            >
              {label}
            </NavLink>
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
