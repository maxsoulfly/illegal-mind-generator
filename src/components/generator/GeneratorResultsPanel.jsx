import SavedLibrary from '../savedLibrary/SavedLibrary';
import GeneratedOutput from './GeneratedOutput';

function GeneratorResultsPanel({
  savedEntries,
  handleLoadEntry,
  handleDeleteEntry,
  handleExportEntries,
  handleImportEntries,
  projectConfig,
  generatedOutput,
  formData,
  panelVisibility,
  setPanelVisibility,
}) {
  return (
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
        shortHooks={generatedOutput.shortHooks}
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
  );
}

export default GeneratorResultsPanel;
