import { useMemo } from 'react';

import projects from './config/projects.json';

import useGeneratedOutput from './hooks/useGeneratedOutput';
import useProjectOverrides from './hooks/useProjectOverrides';

import buildResolvedProjectConfig from './utils/buildResolvedProjectConfig';

import useTagOverrides from './hooks/useTagOverrides';
import useSavedEntries from './hooks/useSavedEntries';
import useStaleTargetClearing from './hooks/useStaleTargetClearing';
import useBlockCollisionRepair from './hooks/useBlockCollisionRepair';
import useToast from './hooks/useToast';

import AppHeader from './components/AppHeader';
import Toast from './components/ui/Toast';

import TagLibraryPage from './pages/TagLibraryPage';
import GeneratorPage from './pages/GeneratorPage';
import ShortsQueuePage from './pages/ShortsQueuePage';
import CalendarPage from './pages/CalendarPage';
import TodoPage from './pages/TodoPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';
import UIKitPage from './pages/UIKitPage';

import { DEFAULT_PROJECT_KEY } from './constants/defaultFormData';

import useAppShellState from './hooks/useAppShellState';

function App() {
  // App-level UI state and persistence.
  const {
    formData,
    setFormData,
    panelVisibility,
    setPanelVisibility,
    titleUppercase,
    setTitleUppercase,
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
    titlesTarget,
    openTitlesSearch,
    clearTitlesTarget,
    thumbnailsTarget,
    openThumbnailsSearch,
    clearThumbnailsTarget,
    hashtagsTarget,
    openHashtagsSearch,
    clearHashtagsTarget,
    openProjectSettings,
    blocksTarget,
    openBlocksEditor,
    clearBlocksTarget,
    songOverrideTarget,
    openSongOverride,
    clearSongOverrideTarget,
    todoTarget,
    openTodoSearch,
    clearTodoTarget,
    activeProjectSettingsSection,
    setActiveProjectSettingsSection,
  } = useAppShellState();

  const { toast, showToast } = useToast();

  useStaleTargetClearing({
    activePage,
    shortHooksTarget, clearShortHooksTarget,
    titlesTarget, clearTitlesTarget,
    thumbnailsTarget, clearThumbnailsTarget,
    hashtagsTarget, clearHashtagsTarget,
    blocksTarget, clearBlocksTarget,
    tagLibrarySearchTarget, clearTagLibrarySearchTarget,
    songOverrideTarget, clearSongOverrideTarget,
    todoTarget, clearTodoTarget,
  });

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
    copyTagFromProject,
  } = useTagOverrides(projectId);

  const {
    projectSettingsOverrides,
    updateProjectOverride,
    resetProjectOverride,
    syncHookTypesToProject,
  } = useProjectOverrides(projectId);

  const otherProjects = Object.entries(projects)
    .filter(([id]) => id !== projectId)
    .map(([id, proj]) => ({ id, name: proj.name }));

  // Runtime config = base config + user overrides.
  const resolvedProjectConfig = useMemo(() => {
    return buildResolvedProjectConfig(
      projectConfig,
      tagOverrides,
      projectSettingsOverrides,
    );
  }, [projectConfig, tagOverrides, projectSettingsOverrides]);

  useBlockCollisionRepair(projectSettingsOverrides, resolvedProjectConfig, updateProjectOverride);

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

  // Loading an entry from a non-Generator page always returns to Generator.
  const loadEntryAndReturnToGenerator = (entry) => {
    handleLoadEntry(entry);
    setActivePage('generator');
    window.scrollTo(0, 0);
  };

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
      <AppHeader
        activePage={activePage}
        setActivePage={setActivePage}
        projectId={projectId}
        setProjectId={handleProjectChange}
        projects={projects}
        projectConfig={resolvedProjectConfig}
        actions={
          activePage === 'generator' ? (
            <button type="button" className="button-primary" onClick={handleRegenerate}>
              Regenerate
            </button>
          ) : undefined
        }
      />
      {/* Main generator workflow */}
      {activePage === 'generator' && (
        <GeneratorPage
          projectId={projectId}
          projects={projects}
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
          handleUpdateEntry={handleUpdateEntry}
          panelVisibility={panelVisibility}
          setPanelVisibility={setPanelVisibility}
          titleUppercase={titleUppercase}
          onToggleTitleUppercase={setTitleUppercase}
          togglePanel={togglePanel}
          tagUsage={tagUsage}
          handleRegenerate={handleRegenerate}
          projectOverrides={tagOverrides}
          projectSettingsOverrides={projectSettingsOverrides}
          onOpenSourceTag={openTagLibrarySearch}
          onOpenSourceHook={openShortHooksSearch}
          onOpenSourceTemplate={openTitlesSearch}
          onOpenSourceThumbnail={openThumbnailsSearch}
          onOpenSourceHashtag={openHashtagsSearch}
          onOpenBlocksEditor={openBlocksEditor}
          onNavigateToSettings={openProjectSettings}
          songOverrideTarget={songOverrideTarget}
          openSongOverride={openSongOverride}
          clearSongOverrideTarget={clearSongOverrideTarget}
          onOpenTodoSearch={openTodoSearch}
          showToast={showToast}
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
          copyTagFromProject={copyTagFromProject}
          onLoadEntry={loadEntryAndReturnToGenerator}
          searchTarget={tagLibrarySearchTarget}
          clearSearchTarget={clearTagLibrarySearchTarget}
          showToast={showToast}
        />
      )}
      {/* Shorts planning queue */}
      {activePage === 'shortsQueue' && (
        <ShortsQueuePage
          key={projectId}
          projectId={projectId}
          savedEntries={savedEntries}
          onLoadEntry={loadEntryAndReturnToGenerator}
          projectConfig={resolvedProjectConfig}
          showToast={showToast}
        />
      )}
      {/* Upload calendar */}
      {activePage === 'calendar' && (
        <CalendarPage
          key={projectId}
          projectId={projectId}
          savedEntries={savedEntries}
          onLoadEntry={loadEntryAndReturnToGenerator}
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
          onLoadEntry={loadEntryAndReturnToGenerator}
          onAddEntries={handleAddEntries}
          panelVisibility={panelVisibility}
          setPanelVisibility={setPanelVisibility}
          togglePanel={togglePanel}
          formData={formData}
          setFormData={setFormData}
          onUpdateEntry={handleUpdateEntry}
          todoTarget={todoTarget}
        />
      )}

      {activePage === 'projectSettings' && (
        <ProjectSettingsPage
          projectId={projectId}
          baseProjectConfig={projectConfig}
          projectConfig={resolvedProjectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
          shortHooksTarget={shortHooksTarget}
          clearShortHooksTarget={clearShortHooksTarget}
          titlesTarget={titlesTarget}
          clearTitlesTarget={clearTitlesTarget}
          thumbnailsTarget={thumbnailsTarget}
          clearThumbnailsTarget={clearThumbnailsTarget}
          hashtagsTarget={hashtagsTarget}
          clearHashtagsTarget={clearHashtagsTarget}
          blocksTarget={blocksTarget}
          clearBlocksTarget={clearBlocksTarget}
          openBlocksEditor={openBlocksEditor}
          activeSection={activeProjectSettingsSection}
          onSectionChange={setActiveProjectSettingsSection}
          otherProjects={otherProjects}
          syncHookTypesToProject={syncHookTypesToProject}
          onOpenUIKit={() => {
            setActivePage('uikit');
            window.scrollTo(0, 0);
          }}
          showToast={showToast}
        />
      )}

      {activePage === 'uikit' && <UIKitPage />}

      <Toast toast={toast} />
    </div>
  );
}

export default App;
