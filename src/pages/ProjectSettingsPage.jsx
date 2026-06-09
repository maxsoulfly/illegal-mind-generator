import { useState } from 'react';

const PROJECT_SETTING_SECTIONS = [
  {
    id: 'general',
    label: 'General',
    description: 'Project identity and management',
  },
  {
    id: 'shortHooks',
    label: 'Shorts Hooks',
    description: 'Hook categories and preset phrases',
  },
  {
    id: 'titles',
    label: 'Titles',
    description: 'Title templates and formatting',
  },
  {
    id: 'descriptions',
    label: 'Descriptions',
    description: 'Description layouts, blocks, and text pools',
  },
  {
    id: 'thumbnails',
    label: 'Thumbnail Templates',
    description: 'Thumbnail words, fallbacks, and patterns',
  },
  {
    id: 'hashtags',
    label: 'Hashtags & YouTube Tags',
    description: 'Project-level metadata tags',
  },
  {
    id: 'todo',
    label: 'Todo Settings',
    description: 'Todo statuses and workflow settings',
  },
];

function getSectionSummary(sectionId, projectConfig) {
  if (sectionId === 'general') {
    return projectConfig.name || 'Unnamed project';
  }

  if (sectionId === 'shortHooks') {
    const count = Object.keys(projectConfig.shortHookTypes || {}).length;
    return `${count} hook groups`;
  }

  if (sectionId === 'titles') {
    const count = Object.keys(projectConfig.title?.templates || {}).length;
    return `${count} template groups`;
  }

  if (sectionId === 'descriptions') {
    const longLayoutCount =
      projectConfig.description?.templates?.long?.layout?.length || 0;
    const shortsLayoutCount =
      projectConfig.description?.templates?.shorts?.layout?.length || 0;

    return `${longLayoutCount} long blocks, ${shortsLayoutCount} shorts blocks`;
  }

  if (sectionId === 'thumbnails') {
    const wordsCount = projectConfig.thumbnail?.words?.length || 0;
    const fallbackCount = projectConfig.thumbnail?.fallbacks?.length || 0;

    return `${wordsCount} words, ${fallbackCount} fallbacks`;
  }

  if (sectionId === 'hashtags') {
    const hashtagCount = projectConfig.hashtags?.length || 0;
    const youtubeTagCount = projectConfig.youtubetags?.length || 0;

    return `${hashtagCount} hashtags, ${youtubeTagCount} YouTube tags`;
  }

  if (sectionId === 'todo') {
    const count = projectConfig.todoStatuses?.length || 0;
    return `${count} statuses`;
  }

  return '';
}

function ProjectSettingsSectionPreview({ activeSection, projectConfig }) {
  if (activeSection === 'general') {
    return (
      <>
        <h2 className="panel-title">General</h2>
        <p className="tag-summary">Project name: {projectConfig.name}</p>
        <p className="tag-summary">
          Project editing and duplication will live here later.
        </p>
      </>
    );
  }

  if (activeSection === 'shortHooks') {
    const hookTypes = Object.entries(projectConfig.shortHookTypes || {});

    return (
      <>
        <h2 className="panel-title">Shorts Hooks</h2>

        {hookTypes.map(([hookType, hookConfig]) => (
          <section key={hookType} className="tag-section">
            <h3 className="tag-summary">{hookConfig.label}</h3>
            <p className="tag-summary">
              {hookConfig.templates?.length || 0} preset phrases
            </p>
          </section>
        ))}
      </>
    );
  }

  if (activeSection === 'titles') {
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

  if (activeSection === 'descriptions') {
    return (
      <>
        <h2 className="panel-title">Descriptions</h2>
        <p className="tag-summary">
          Description layout and phrase editing will be added here later.
        </p>
      </>
    );
  }

  if (activeSection === 'thumbnails') {
    return (
      <>
        <h2 className="panel-title">Thumbnail Templates</h2>
        <p className="tag-summary">
          Thumbnail words, fallbacks, and patterns will be edited here later.
        </p>
      </>
    );
  }

  if (activeSection === 'hashtags') {
    return (
      <>
        <h2 className="panel-title">Hashtags & YouTube Tags</h2>
        <p className="tag-summary">
          Project-level hashtags and YouTube tags will be edited here later.
        </p>
      </>
    );
  }

  if (activeSection === 'todo') {
    return (
      <>
        <h2 className="panel-title">Todo Settings</h2>
        <p className="tag-summary">
          Todo statuses and workflow settings will be edited here later.
        </p>
      </>
    );
  }

  return null;
}

export default function ProjectSettingsPage({ projectId, projectConfig }) {
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
            title={getSectionSummary(section.id, projectConfig)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <ProjectSettingsSectionPreview
          activeSection={activeSection}
          projectConfig={projectConfig}
        />
      </div>
    </section>
  );
}
