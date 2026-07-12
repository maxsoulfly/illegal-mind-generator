import { useEffect, useMemo } from 'react';

import projects from './config/projects.json';

import useGeneratedOutput from './hooks/useGeneratedOutput';
import useProjectOverrides from './hooks/useProjectOverrides';

import buildResolvedProjectConfig from './utils/buildResolvedProjectConfig';
import { resolveCustomBlockCollisions } from './utils/customBlocks';

import useTagOverrides from './hooks/useTagOverrides';
import useSavedEntries from './hooks/useSavedEntries';

import AppHeader from './components/AppHeader';

import TagLibraryPage from './pages/TagLibraryPage';
import GeneratorPage from './pages/GeneratorPage';
import ShortsQueuePage from './pages/ShortsQueuePage';
import TodoPage from './pages/TodoPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';
import UIKitPage from './pages/UIKitPage';

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

  // Self-healing repair for customBlocks keys that collide with a hook
  // block's key/layout-key (see resolveCustomBlockCollisions) — silently
  // breaks generation for the colliding hook block otherwise. Runs whenever
  // the resolved hookBlocks set or overrides change; naturally stabilizes
  // after one fix since the next run finds no more collisions to repair.
  useEffect(() => {
    const result = resolveCustomBlockCollisions(
      projectSettingsOverrides,
      resolvedProjectConfig.description?.hookBlocks || [],
      resolvedProjectConfig.description?.blockGroups || [],
    );
    if (!result) return;

    if (result.skipped.length) {
      console.warn(
        'Song-scoped custom block(s) collide with a Hook Block key and were not auto-renamed (per-song override data can\'t be safely migrated automatically):',
        result.skipped.map((s) => s.oldKey),
      );
    }
    if (result.patch) {
      console.warn(
        'Renamed colliding custom block key(s) to fix generation:',
        result.renamed,
      );
      updateProjectOverride(result.patch);
    }
  }, [projectSettingsOverrides, resolvedProjectConfig, updateProjectOverride]);

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
          baseProjectConfig={projectConfig}
          projectConfig={resolvedProjectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          updateProjectOverride={updateProjectOverride}
          resetProjectOverride={resetProjectOverride}
          shortHooksTarget={shortHooksTarget}
          clearShortHooksTarget={clearShortHooksTarget}
          openShortHooksSearch={openShortHooksSearch}
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
          onOpenUIKit={() => setActivePage('uikit')}
        />
      )}

      {activePage === 'uikit' && <UIKitPage />}
    </div>
  );
}

export default App;
