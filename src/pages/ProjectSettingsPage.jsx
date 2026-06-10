import { useEffect, useState } from 'react';

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
  shortHooksTarget,
  clearShortHooksTarget,
}) {
  const [activeSection, setActiveSection] = useState('general');
  // Local copy so the highlight persists after the external target is cleared.
  const [hookTarget, setHookTarget] = useState(null);

  useEffect(() => {
    if (!shortHooksTarget) return;
    setActiveSection('shortHooks');
    setHookTarget(shortHooksTarget);
    clearShortHooksTarget();
  }, [shortHooksTarget]);

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
          hookTarget={hookTarget}
        />
      </div>
    </section>
  );
}
