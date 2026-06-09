import GeneratedOutput from './GeneratedOutput';

function GeneratorResultsPanel({
  projectConfig,
  generatedOutput,
  formData,
  panelVisibility,
  setPanelVisibility,
  onOpenSourceTag,
}) {
  return (
    <div className="panel">
      <h2>Output</h2>
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
        onOpenSourceTag={onOpenSourceTag}
      />
    </div>
  );
}

export default GeneratorResultsPanel;
