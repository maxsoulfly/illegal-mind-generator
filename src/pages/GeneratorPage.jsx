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
}) {
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

      <div className="layout-grid">
        <div className="panel">
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
          savedEntries={savedEntries}
          handleLoadEntry={handleLoadEntry}
          handleDeleteEntry={handleDeleteEntry}
          handleExportEntries={handleExportEntries}
          handleImportEntries={handleImportEntries}
          projectConfig={projectConfig}
          generatedOutput={generatedOutput}
          formData={formData}
          panelVisibility={panelVisibility}
          setPanelVisibility={setPanelVisibility}
          onOpenSourceTag={onOpenSourceTag}
        />
      </div>
    </>
  );
}
