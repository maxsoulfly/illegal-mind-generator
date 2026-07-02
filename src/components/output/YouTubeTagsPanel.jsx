import ToggleButton from '../ui/ToggleButton';
import OutputItem from '../ui/OutputItem';

function YouTubeTagsPanel({ youtubeTags, panelVisibility, togglePanel }) {
  return (
    <div
      className={`panel ${panelVisibility.youtubeTags ? '' : 'panel-collapsed'}`}
    >
      <div className="panel-header">
        <h2 className="panel-title">YouTube Tags</h2>
        <ToggleButton
          isOpen={panelVisibility.youtubeTags}
          onClick={() => togglePanel('youtubeTags')}
          label="YouTube Tags"
          compact
        />
      </div>

      {panelVisibility.youtubeTags && <OutputItem text={youtubeTags} />}
    </div>
  );
}

export default YouTubeTagsPanel;
