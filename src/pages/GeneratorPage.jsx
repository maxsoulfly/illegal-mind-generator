import InputForm from '../components/InputForm';
import SavedLibrary from '../components/SavedLibrary';
import GeneratedOutput from '../components/GeneratedOutput';

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
          />
        </div>

        <div className="panel">
          <SavedLibrary
            savedEntries={savedEntries}
            onLoadEntry={handleLoadEntry}
            onDeleteEntry={handleDeleteEntry}
            onExportEntries={handleExportEntries}
            onImportEntries={handleImportEntries}
            projectConfig={projectConfig}
          />
          <GeneratedOutput
            titles={generatedOutput.titles}
            thumbnails={generatedOutput.thumbnails}
            descriptions={generatedOutput.shortDescriptions}
            hashtags={generatedOutput.hashtags}
            youtubeTags={generatedOutput.youtubeTags}
            hybridPrompt={generatedOutput.hybridPrompt}
            videoType={formData.videoType}
            longDescription={generatedOutput.longDescription}
            panelVisibility={panelVisibility}
            setPanelVisibility={setPanelVisibility}
            fileId={generatedOutput.fileId}
            projectConfig={projectConfig}
          />
        </div>
      </div>
    </>
  );
}
