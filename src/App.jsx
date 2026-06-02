import { useEffect, useMemo, useState } from 'react';

import projects from './config/projects.json';

import { generateDescriptions } from './engine/descriptions/generateDescriptions';
import { generateTitles } from './engine/titles/generateTitles';
import { generateThumbnails } from './engine/titles/generateThumbnails';
import { generateHashtags } from './engine/hashtags/generateHashtags';
import { generateShortHooks } from './engine/hooks/generateShortHooks';

import buildResolvedProjectConfig from './utils/buildResolvedProjectConfig';

import useTagOverrides from './hooks/useTagOverrides';
import useSavedEntries from './hooks/useSavedEntries';

import AppMenu from './components/AppMenu';

import TagLibraryPage from './pages/TagLibraryPage';
import GeneratorPage from './pages/GeneratorPage';
import ShortsQueuePage from './pages/ShortsQueuePage';
import TodoPage from './pages/TodoPage';

import { DEFAULT_PROJECT_KEY } from './constants/defaultFormData';

import {
  previewUnifiedStorageMigration,
  writeUnifiedStorageMigration,
} from './utils/storageMigration';
import useAppShellState from './hooks/useAppShellState';

function App() {
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
  } = useAppShellState();

  const [generationSeed, setGenerationSeed] = useState(0);

  // effects
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    window.previewUnifiedStorageMigration = previewUnifiedStorageMigration;
    window.writeUnifiedStorageMigration = writeUnifiedStorageMigration;

    return () => {
      delete window.previewUnifiedStorageMigration;
      delete window.writeUnifiedStorageMigration;
    };
  }, []);

  const projectConfig = useMemo(() => {
    return projects[projectId] || projects[DEFAULT_PROJECT_KEY] || {};
  }, [projectId]);
  const { projectOverrides, updateTagOverride, resetTagOverride } =
    useTagOverrides(projectId);

  const resolvedProjectConfig = useMemo(() => {
    return buildResolvedProjectConfig(projectConfig, projectOverrides);
  }, [projectConfig, projectOverrides]);

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

  const generatedOutput = useMemo(() => {
    const titles = generateTitles(formData, resolvedProjectConfig);
    const thumbnails = generateThumbnails(formData, resolvedProjectConfig);

    const shortHooks = generateShortHooks(formData, resolvedProjectConfig);

    const { longDescription, shortDescriptions, fileId } = generateDescriptions(
      formData,
      resolvedProjectConfig,
      shortHooks,
    );

    const hashtagOutput = generateHashtags(formData, resolvedProjectConfig);

    const hashtags = hashtagOutput.hashtags;
    const youtubeTags = hashtagOutput.youtubeTags;

    return {
      titles,
      thumbnails,
      longDescription,
      shortDescriptions,
      hashtags,
      youtubeTags,
      shortHooks,
      fileId,
    };
  }, [formData, resolvedProjectConfig, generationSeed]);

  // const projectOptions = Object.keys(projects);

  // Clear form

  const handleRegenerate = () => {
    setGenerationSeed((prev) => prev + 1);
  };

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
      <AppMenu
        activePage={activePage}
        setActivePage={setActivePage}
        projectId={projectId}
        setProjectId={handleProjectChange}
        projects={projects}
      />
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
          projectOverrides={projectOverrides}
        />
      )}
      {activePage === 'tags' && (
        <TagLibraryPage
          projectId={projectId}
          projectConfig={resolvedProjectConfig}
          savedEntries={savedEntries}
          projectName={projectConfig.name}
          projectOverrides={projectOverrides}
          updateTagOverride={updateTagOverride}
          resetTagOverride={resetTagOverride}
          onLoadEntry={(entry) => {
            handleLoadEntry(entry);
            setActivePage('generator');
          }}
        />
      )}
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
    </div>
  );
}

export default App;
