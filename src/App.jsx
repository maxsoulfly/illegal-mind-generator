import { useEffect, useMemo } from 'react';

import projects from './config/projects.json';

import useGeneratedOutput from './hooks/useGeneratedOutput';
import useProjectOverrides from './hooks/useProjectOverrides';

import buildResolvedProjectConfig from './utils/buildResolvedProjectConfig';

import useTagOverrides from './hooks/useTagOverrides';
import useSavedEntries from './hooks/useSavedEntries';

import AppMenu from './components/AppMenu';

import TagLibraryPage from './pages/TagLibraryPage';
import GeneratorPage from './pages/GeneratorPage';
import ShortsQueuePage from './pages/ShortsQueuePage';
import TodoPage from './pages/TodoPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';

import { DEFAULT_PROJECT_KEY } from './constants/defaultFormData';

import {
  previewUnifiedStorageMigration,
  writeUnifiedStorageMigration,
} from './utils/storageMigration';
import useAppShellState from './hooks/useAppShellState';

function App() {
  // App-level UI state and persistence.
  const {
    formData,
    setFormData,
    panelVisibility,
    setPanelVisibility,
    activePage,
    setActivePage,
    projectId,
    handleProjectChange,
    togglePanel,
    handleClearForm,
    tagLibrarySearchTarget,
    openTagLibrarySearch,
    clearTagLibrarySearchTarget,
    shortHooksTarget,
    openShortHooksSearch,
    clearShortHooksTarget,
    activeProjectSettingsSection,
    setActiveProjectSettingsSection,
  } = useAppShellState();
  // Development-only storage migration helpers.
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    window.previewUnifiedStorageMigration = previewUnifiedStorageMigration;
    window.writeUnifiedStorageMigration = writeUnifiedStorageMigration;

    return () => {
      delete window.previewUnifiedStorageMigration;
      delete window.writeUnifiedStorageMigration;
    };
  }, []);

  // Base project config from projects.json.
  const projectConfig = useMemo(() => {
    return projects[projectId] || projects[DEFAULT_PROJECT_KEY] || {};
  }, [projectId]);

  // User tag overrides stored in localStorage.
  const {
    projectOverrides: tagOverrides,
    updateTagOverride,
    resetTagOverride,
    syncProjectTags,
  } = useTagOverrides(projectId);

  const {
    projectSettingsOverrides,
    updateProjectOverride,
    resetProjectOverride,
  } = useProjectOverrides(projectId);

  // Runtime config = base config + user overrides.
  const resolvedProjectConfig = useMemo(() => {
    return buildResolvedProjectConfig(
      projectConfig,
      tagOverrides,
      projectSettingsOverrides,
    );
  }, [projectConfig, tagOverrides, projectSettingsOverrides]);

  // Saved entries CRUD and import/export.
  const {
    savedEntries,
    handleSaveEntry,
    handleLoadEntry,
    handleDeleteEntry,
    handleExportEntries,
    handleImportEntries,
    handleUpdateEntryTodo,
    handleAddEntries,
    handleUpdateEntry,
  } = useSavedEntries(formData, setFormData, projectId, projectConfig.name);

  // Generated titles, descriptions, hooks, hashtags, etc.
  const { generatedOutput, handleRegenerate } = useGeneratedOutput(
    formData,
    resolvedProjectConfig,
  );

  // Usage statistics used by Tag Library.
  const tagUsage = useMemo(() => {
    return savedEntries.reduce((acc, entry) => {
      (entry.transformationTags || []).forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });

      return acc;
    }, {});
  }, [savedEntries]);

  return (
    <div className="app-shell">
      {/* Global navigation and project selector */}
      <AppMenu
        activePage={activePage}
        setActivePage={setActivePage}
        projectId={projectId}
        setProjectId={handleProjectChange}
        projects={projects}
        projectConfig={resolvedProjectConfig}
      />
      {/* Main generator workflow */}
      {activePage === 'generator' && (
        <GeneratorPage
          projectId={projectId}
          formData={formData}
          setFormData={setFormData}
          projectConfig={resolvedProjectConfig}
          generatedOutput={generatedOutput}
          savedEntries={savedEntries}
          handleSaveEntry={handleSaveEntry}
          handleClearForm={handleClearForm}
          handleLoadEntry={handleLoadEntry}
          handleDeleteEntry={handleDeleteEntry}
          handleExportEntries={handleExportEntries}
          handleImportEntries={handleImportEntries}
          panelVisibility={panelVisibility}
          setPanelVisibility={setPanelVisibility}
          togglePanel={togglePanel}
          tagUsage={tagUsage}
          handleRegenerate={handleRegenerate}
          projectOverrides={tagOverrides}
          onOpenSourceTag={openTagLibrarySearch}
          onOpenSourceHook={openShortHooksSearch}
        />
      )}
      {/* Tag management and phrase editing */}
      {activePage === 'tags' && (
        <TagLibraryPage
          projectId={projectId}
          projects={projects}
          projectConfig={resolvedProjectConfig}
          savedEntries={savedEntries}
          projectOverrides={tagOverrides}
          updateTagOverride={updateTagOverride}
          resetTagOverride={resetTagOverride}
          syncProjectTags={syncProjectTags}
          onLoadEntry={(entry) => {
            handleLoadEntry(entry);
            setActivePage('generator');
          }}
          searchTarget={tagLibrarySearchTarget}
          clearSearchTarget={clearTagLibrarySearchTarget}
        />
      )}
      {/* Shorts planning queue */}
      {activePage === 'shortsQueue' && (
        <ShortsQueuePage
          key={projectId}
          projectId={projectId}
          savedEntries={savedEntries}
          onLoadEntry={(entry) => {
            handleLoadEntry(entry);
            setActivePage('generator');
          }}
          projectConfig={resolvedProjectConfig}
        />
      )}
      {/* Cover planning and tracking */}
      {activePage === 'todo' && (
        <TodoPage
          savedEntries={savedEntries}
          todoStatuses={resolvedProjectConfig.todoStatuses || []}
          projectConfig={resolvedProjectConfig}
          onUpdateEntryTodo={handleUpdateEntryTodo}
          onLoadEntry={(entry) => {
            handleLoadEntry(entry);
            setActivePage('generator');
          }}
          onAddEntries={handleAddEntries}
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
          formData={formData}
          setFormData={setFormData}
          onUpdateEntry={handleUpdateEntry}
        />
      )}

      {activePage === 'projectSettings' && (
        <ProjectSettingsPage
          projectId={projectId}
          projectConfig={resolvedProjectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
          shortHooksTarget={shortHooksTarget}
          clearShortHooksTarget={clearShortHooksTarget}
          activeSection={activeProjectSettingsSection}
          onSectionChange={setActiveProjectSettingsSection}
        />
      )}
    </div>
  );
}

export default App;
