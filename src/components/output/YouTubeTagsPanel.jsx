import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';

function YouTubeTagsPanel({ youtubeTags, panelVisibility, togglePanel }) {
  return (
    <CollapsiblePanel
      label="YouTube Tags"
      visible={panelVisibility.youtubeTags}
      onToggle={() => togglePanel('youtubeTags')}
    >
      <OutputItem text={youtubeTags} />
    </CollapsiblePanel>
  );
}

export default YouTubeTagsPanel;
