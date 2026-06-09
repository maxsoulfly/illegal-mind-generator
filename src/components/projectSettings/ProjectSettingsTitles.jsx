export default function ProjectSettingsTitles({ projectConfig }) {
  const titleTemplates = Object.entries(projectConfig.title?.templates || {});

  return (
    <>
      <h2 className="panel-title">Titles</h2>

      {titleTemplates.map(([groupName, templates]) => (
        <section key={groupName} className="tag-section">
          <h3 className="tag-summary">{groupName}</h3>
          <p className="tag-summary">{templates.length} templates</p>
        </section>
      ))}
    </>
  );
}
