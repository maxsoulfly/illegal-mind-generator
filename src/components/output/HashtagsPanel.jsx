import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';

function HashtagsPanel({ hashtags, panelVisibility, togglePanel }) {
  return (
    <CollapsiblePanel
      label="Hashtags"
      visible={panelVisibility.hashtags}
      onToggle={() => togglePanel('hashtags')}
    >
      <OutputItem text={hashtags} />
    </CollapsiblePanel>
  );
}

export default HashtagsPanel;
