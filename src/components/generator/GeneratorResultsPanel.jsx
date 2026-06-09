import TitlesPanel from '../output/TitlesPanel';
import DescriptionsPanel from '../output/DescriptionsPanel';
import HashtagsPanel from '../output/HashtagsPanel';
import YouTubeTagsPanel from '../output/YouTubeTagsPanel';

function GeneratorResultsPanel({
  projectConfig,
  generatedOutput,
  formData,
  panelVisibility,
  setPanelVisibility,
  onOpenSourceTag,
}) {
  const togglePanel = (key) => {
    setPanelVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderCopyFooter = () => {
    const template = projectConfig?.description?.copyFooter;

    if (!template) return '';

    return template
      .replace(/\{fileId\}/g, generatedOutput.fileId || '')
      .replace(/\{hashtags\}/g, generatedOutput.hashtags || '');
  };

  return (
    <div className="panel">
      <h2>Output</h2>
      <div className="output-stack">
        <TitlesPanel
          titles={generatedOutput.titles}
          thumbnails={generatedOutput.thumbnails}
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
          shortHooks={generatedOutput.shortHooks}
          videoType={formData.videoType}
          onOpenSourceTag={onOpenSourceTag}
        />

        <DescriptionsPanel
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
          videoType={formData.videoType}
          descriptions={generatedOutput.shortDescriptions}
          longDescription={generatedOutput.longDescription}
          renderCopyFooter={renderCopyFooter}
        />

        <HashtagsPanel
          hashtags={generatedOutput.hashtags}
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
        />

        <YouTubeTagsPanel
          youtubeTags={generatedOutput.youtubeTags}
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
        />
      </div>
    </div>
  );
}

export default GeneratorResultsPanel;
