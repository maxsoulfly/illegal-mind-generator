import ToggleButton from '../ui/ToggleButton';
import OutputItem from '../ui/OutputItem';

function HashtagsPanel({ hashtags, panelVisibility, togglePanel }) {
  return (
    <div
      className={`panel ${panelVisibility.hashtags ? '' : 'panel-collapsed'}`}
    >
      <div className="panel-header">
        <h2 className="panel-title">Hashtags</h2>
        <ToggleButton
          isOpen={panelVisibility.hashtags}
          onClick={() => togglePanel('hashtags')}
          label="Hashtags"
          compact
        />
      </div>
      {panelVisibility.hashtags && <OutputItem text={hashtags} />}
    </div>
  );
}

export default HashtagsPanel;
