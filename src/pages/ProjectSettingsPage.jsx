import {
  PROJECT_SETTING_SECTIONS,
  getProjectSettingsSectionSummary,
} from '../config/projectSettingsSections';

import ProjectSettingsContent from '../components/projectSettings/ProjectSettingsContent';

export default function ProjectSettingsPage({
  projectId,
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
  shortHooksTarget,
  clearShortHooksTarget,
  openShortHooksSearch,
  titlesTarget,
  clearTitlesTarget,
  blocksTarget,
  clearBlocksTarget,
  openBlocksEditor,
  activeSection,
  onSectionChange,
}) {
  // Navigation targets override the active section; clears on any manual tab click.
  const resolvedSection = shortHooksTarget ? 'shortHooks' : titlesTarget ? 'titles' : blocksTarget ? 'blocks' : activeSection;

  function handleSectionChange(sectionId) {
    onSectionChange(sectionId);
    if (shortHooksTarget) clearShortHooksTarget();
    if (titlesTarget) clearTitlesTarget();
    if (blocksTarget) clearBlocksTarget();
  }

  return (
    <section className="page-panel">
      <div className="panel-header">
        <h1 className="app-title">Project Settings — {projectConfig.name}</h1>
      </div>

      <div className="tag-filters">
        {PROJECT_SETTING_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={resolvedSection === section.id ? 'active' : ''}
            onClick={() => handleSectionChange(section.id)}
            title={getProjectSettingsSectionSummary(section.id, projectConfig)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <ProjectSettingsContent
          activeSection={resolvedSection}
          projectId={projectId}
          baseProjectConfig={baseProjectConfig}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
          hookTarget={shortHooksTarget}
          openShortHooksSearch={openShortHooksSearch}
          titlesTarget={titlesTarget}
          blocksTarget={blocksTarget}
          clearBlocksTarget={clearBlocksTarget}
          openBlocksEditor={openBlocksEditor}
        />
      </div>
    </section>
  );
}
