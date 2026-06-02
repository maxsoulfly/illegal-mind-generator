import TitlesPanel from '../output/TitlesPanel';
import DescriptionsPanel from '../output/DescriptionsPanel';
import HashtagsPanel from '../output/HashtagsPanel';
import YouTubeTagsPanel from '../output/YouTubeTagsPanel';
import ShortHooksPanel from '../output/ShortHooksPanel';
// import HybridPromptPanel from './output/HybridPromptPanel';

function GeneratedOutput({
  titles,
  thumbnails,
  descriptions,
  hashtags,
  youtubeTags,
  longDescription,
  videoType,
  panelVisibility,
  setPanelVisibility,
  fileId,
  projectConfig,
  shortHooks,
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
      .replace(/\{fileId\}/g, fileId || '')
      .replace(/\{hashtags\}/g, hashtags || '');
  };

  return (
    <div className="output-stack">
      {/* TITLES */}
      <TitlesPanel
        titles={titles}
        thumbnails={thumbnails}
        panelVisibility={panelVisibility}
        togglePanel={togglePanel}
        shortHooks={shortHooks}
        videoType={videoType}
      />

      {/* DESCRIPTIONS */}
      <DescriptionsPanel
        panelVisibility={panelVisibility}
        togglePanel={togglePanel}
        videoType={videoType}
        descriptions={descriptions}
        longDescription={longDescription}
        renderCopyFooter={renderCopyFooter}
      />

      {/* HASHTAGS */}
      <HashtagsPanel
        hashtags={hashtags}
        panelVisibility={panelVisibility}
        togglePanel={togglePanel}
      />

      {/* YOUTUBE TAGS */}
      <YouTubeTagsPanel
        youtubeTags={youtubeTags}
        panelVisibility={panelVisibility}
        togglePanel={togglePanel}
      />
    </div>
  );
}

export default GeneratedOutput;
