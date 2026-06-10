import { useState } from 'react';

import {
  PROJECT_SETTING_SECTIONS,
  getProjectSettingsSectionSummary,
} from '../config/projectSettingsSections';

import ProjectSettingsContent from '../components/projectSettings/ProjectSettingsContent';
import ProjectSettingsGeneral from '../components/projectSettings/ProjectSettingsGeneral';

export default function ProjectSettingsPage({
  projectId,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  resetProjectOverride,
}) {
  const [activeSection, setActiveSection] = useState('general');

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
            className={activeSection === section.id ? 'active' : ''}
            onClick={() => setActiveSection(section.id)}
            title={getProjectSettingsSectionSummary(section.id, projectConfig)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <ProjectSettingsContent
          activeSection={activeSection}
          projectId={projectId}
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
        />
      </div>
    </section>
  );
}
