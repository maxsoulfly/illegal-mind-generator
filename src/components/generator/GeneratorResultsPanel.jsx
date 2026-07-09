import TitlesPanel from '../output/TitlesPanel';
import ThumbnailsPanel from '../output/ThumbnailsPanel';
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
  onOpenSourceHook,
  onOpenSourceTemplate,
  onOpenSourceThumbnail,
  onOpenBlocksEditor,
  onNavigateToSettings,
  useHooksForLongTitles,
  onToggleHooksForLongTitles,
  titleUppercase,
  onToggleTitleUppercase,
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
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
          shortHooks={generatedOutput.shortHooks}
          videoType={formData.videoType}
          titleCount={projectConfig.title?.count ?? 5}
          onOpenSourceTag={onOpenSourceTag}
          onOpenSourceHook={onOpenSourceHook}
          onOpenSourceTemplate={onOpenSourceTemplate}
          onNavigateToSettings={onNavigateToSettings}
          useHooksForLongTitles={useHooksForLongTitles}
          onToggleHooksForLongTitles={onToggleHooksForLongTitles}
          titleUppercase={titleUppercase}
          onToggleTitleUppercase={onToggleTitleUppercase}
        />

        <ThumbnailsPanel
          thumbnails={generatedOutput.thumbnails}
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
          onOpenSourceThumbnail={onOpenSourceThumbnail}
          onOpenSourceTag={onOpenSourceTag}
          onNavigateToSettings={onNavigateToSettings}
        />

        <DescriptionsPanel
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
          videoType={formData.videoType}
          descriptions={generatedOutput.shortDescriptions}
          descriptionSegments={generatedOutput.shortDescriptionSegments}
          longDescription={generatedOutput.longDescription}
          renderCopyFooter={renderCopyFooter}
          onNavigateToSettings={onNavigateToSettings}
          onOpenSourceTag={onOpenSourceTag}
          onOpenSourceHook={onOpenSourceHook}
          onOpenBlocksEditor={onOpenBlocksEditor}
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
