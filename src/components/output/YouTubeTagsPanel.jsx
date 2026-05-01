import CopyButton from '../CopyButton';
import ToggleButton from '../ToggleButton';

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

      {panelVisibility.youtubeTags && (
        <div className="output-item terminal-block">
          <p className="output-text">{youtubeTags}</p>
          <CopyButton text={youtubeTags} />
        </div>
      )}
    </div>
  );
}

export default YouTubeTagsPanel;
