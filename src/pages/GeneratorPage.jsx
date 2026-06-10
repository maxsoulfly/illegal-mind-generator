import { useState } from 'react';

import SavedLibrary from '../components/savedLibrary/SavedLibrary';
import InputForm from '../components/InputForm';
import GeneratorResultsPanel from '../components/generator/GeneratorResultsPanel';

export default function GeneratorPage({
  formData,
  setFormData,
  projectId,
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
}) {
  const [inputFlash, setInputFlash] = useState(false);

  const [showSavedLibrary, setShowSavedLibrary] = useState(() => {
    const saved = localStorage.getItem('showSavedLibrary');
    return saved ? JSON.parse(saved) : false;
  });

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
      <div className="panel-header">
        <h1 className="app-title">Generator — {projectConfig.name}</h1>
        <div className="regenerate-row">
          <button
            type="button"
            className="button-primary"
            onClick={handleRegenerate}
          >
            Regenerate
          </button>
        </div>
      </div>

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
        />
      </div>
    </>
  );
}
