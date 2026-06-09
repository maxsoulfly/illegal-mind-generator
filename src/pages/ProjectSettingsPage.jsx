function renderList(items = []) {
  if (!items.length) {
    return <p className="tag-summary">No items configured.</p>;
  }

  return (
    <ul className="tag-song-links">
      {items.map((item) => (
        <li key={item} className="tag-song-link">
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProjectSettingsPage({ projectId, projectConfig }) {
  const shortHookTypes = Object.entries(projectConfig.shortHookTypes || {});
  const titleTemplates = Object.entries(projectConfig.title?.templates || {});
  const hashtags = projectConfig.hashtags || [];
  const youtubeTags = projectConfig.youtubetags || [];
  const todoStatuses = projectConfig.todoStatuses || [];

  return (
    <section className="page-panel">
      <div className="panel-header">
        <h1 className="app-title">Project Settings — {projectConfig.name}</h1>
      </div>

      <div className="tag-library">
        <article className="tag-card">
          <div className="tag-card-header">
            <h3>Shorts Hook Presets</h3>
            <span className="tag-status">{shortHookTypes.length} groups</span>
          </div>

          {shortHookTypes.map(([hookType, hookConfig]) => (
            <section key={hookType} className="tag-section">
              <h4 className="tag-summary">{hookConfig.label}</h4>
              {renderList(hookConfig.templates)}
            </section>
          ))}
        </article>

        <article className="tag-card">
          <div className="tag-card-header">
            <h3>Title Templates</h3>
            <span className="tag-status">{titleTemplates.length} groups</span>
          </div>

          {titleTemplates.map(([templateGroup, templates]) => (
            <section key={templateGroup} className="tag-section">
              <h4 className="tag-summary">{templateGroup}</h4>
              {renderList(templates)}
            </section>
          ))}
        </article>

        <article className="tag-card">
          <div className="tag-card-header">
            <h3>Hashtags</h3>
            <span className="tag-status">{hashtags.length} items</span>
          </div>

          {renderList(hashtags)}
        </article>

        <article className="tag-card">
          <div className="tag-card-header">
            <h3>YouTube Tags</h3>
            <span className="tag-status">{youtubeTags.length} items</span>
          </div>

          {renderList(youtubeTags)}
        </article>

        <article className="tag-card">
          <div className="tag-card-header">
            <h3>Todo Statuses</h3>
            <span className="tag-status">{todoStatuses.length} items</span>
          </div>

          {renderList(todoStatuses)}
        </article>
      </div>
    </section>
  );
}
