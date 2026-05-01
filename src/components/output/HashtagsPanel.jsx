import CopyButton from '../CopyButton';
import ToggleButton from '../ToggleButton';

function HashtagsPanel({ hashtags, panelVisibility, togglePanel }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Hashtags</h2>
      </div>
      <ToggleButton
        isOpen={panelVisibility.hashtags}
        onClick={() => togglePanel('hashtags')}
        label="Hashtags"
      />

      {panelVisibility.hashtags && (
        <div className="output-item terminal-block">
          <p className="output-text">{hashtags}</p>
          <CopyButton text={hashtags} />
        </div>
      )}
    </div>
  );
}

export default HashtagsPanel;
