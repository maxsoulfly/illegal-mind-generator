import { useEffect, useState } from 'react';

import SavedLibrary from '../components/savedLibrary/SavedLibrary';
import InputForm from '../components/InputForm';
import GeneratorResultsPanel from '../components/generator/GeneratorResultsPanel';
import { updateAppStorage } from '../utils/storage';

// Unified storage applies a default for ui.showSavedLibrary, so a plain
// loadAppStorage() read can't tell "never set" apart from "explicitly false".
// Read the raw stored JSON instead to check whether it was actually written.
function readRawUnifiedUi() {
  try {
    return JSON.parse(localStorage.getItem('illegalMindGeneratorData'))?.ui;
  } catch {
    return undefined;
  }
}

export default function GeneratorPage({
  formData,
  setFormData,
  projectId,
  projects,
  projectConfig,
  generatedOutput,
  savedEntries,
  panelVisibility,
  togglePanel,
  tagUsage,
  handleRegenerate,
  handleSaveEntry,
  handleClearForm,
  handleLoadEntry,
  handleDeleteEntry,
  handleExportEntries,
  handleImportEntries,
  setPanelVisibility,
  projectOverrides,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenSourceTemplate,
  onOpenSourceThumbnail,
  onNavigateToSettings,
}) {
  const [inputFlash, setInputFlash] = useState(false);

  // Resolve whether to mix shorts hooks into long title candidates.
  // formData.useHooksForLongTitles acts as a per-session override of the
  // project config default (projectConfig.title.useHooksForLongTitles).
  const useHooksForLongTitles =
    formData.useHooksForLongTitles ?? projectConfig.title?.useHooksForLongTitles ?? false;

  const handleToggleHooksForLongTitles = () => {
    setFormData((prev) => ({
      ...prev,
      useHooksForLongTitles: !useHooksForLongTitles,
    }));
  };

  const [showSavedLibrary, setShowSavedLibrary] = useState(() => {
    const ui = readRawUnifiedUi();

    if (typeof ui?.showSavedLibrary === 'boolean') {
      return ui.showSavedLibrary;
    }

    const saved = localStorage.getItem('showSavedLibrary');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        showSavedLibrary,
      },
    }));
  }, [showSavedLibrary]);

  const handleLoadEntryFromLibrary = (entry) => {
    handleLoadEntry(entry);

    setShowSavedLibrary(false);

    setInputFlash(true);

    window.setTimeout(() => {
      setInputFlash(false);
    }, 700);
  };
  return (
    <>
      <SavedLibrary
        savedEntries={savedEntries}
        onLoadEntry={handleLoadEntryFromLibrary}
        onDeleteEntry={handleDeleteEntry}
        onExportEntries={handleExportEntries}
        onImportEntries={handleImportEntries}
        projectConfig={projectConfig}
        showSavedLibrary={showSavedLibrary}
        setShowSavedLibrary={setShowSavedLibrary}
      />

      <div className="layout-grid">
        <div className={`panel ${inputFlash ? 'panel-flash-success' : ''}`}>
          <InputForm
            projectId={projectId}
            projects={projects}
            formData={formData}
            setFormData={setFormData}
            onClear={handleClearForm}
            projectConfig={projectConfig}
            onSaveEntry={handleSaveEntry}
            savedEntries={savedEntries}
            onLoadEntry={handleLoadEntry}
            onDeleteEntry={handleDeleteEntry}
            onExportEntries={handleExportEntries}
            onImportEntries={handleImportEntries}
            tagUsage={tagUsage}
            panelVisibility={panelVisibility}
            togglePanel={togglePanel}
            projectOverrides={projectOverrides}
          />
        </div>
        <GeneratorResultsPanel
          projectConfig={projectConfig}
          generatedOutput={generatedOutput}
          formData={formData}
          panelVisibility={panelVisibility}
          setPanelVisibility={setPanelVisibility}
          onOpenSourceTag={onOpenSourceTag}
          onOpenSourceHook={onOpenSourceHook}
          onOpenSourceTemplate={onOpenSourceTemplate}
          onOpenSourceThumbnail={onOpenSourceThumbnail}
          onNavigateToSettings={onNavigateToSettings}
          useHooksForLongTitles={useHooksForLongTitles}
          onToggleHooksForLongTitles={handleToggleHooksForLongTitles}
        />
      </div>
    </>
  );
}
