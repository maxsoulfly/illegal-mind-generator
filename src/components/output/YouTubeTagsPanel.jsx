import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';

function YouTubeTagsPanel({ youtubeTags, panelVisibility, togglePanel, onNavigateToSettings }) {
  return (
    <CollapsiblePanel
      label="YouTube Tags"
      visible={panelVisibility.youtubeTags}
      onToggle={() => togglePanel('youtubeTags')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('hashtags') : undefined}
    >
      <OutputItem text={youtubeTags} />
    </CollapsiblePanel>
  );
}

export default YouTubeTagsPanel;
