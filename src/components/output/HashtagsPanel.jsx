import OutputItem from '../ui/OutputItem';
import CollapsiblePanel from '../ui/CollapsiblePanel';

function HashtagsPanel({ hashtags, panelVisibility, togglePanel, onNavigateToSettings }) {
  return (
    <CollapsiblePanel
      label="Hashtags"
      visible={panelVisibility.hashtags}
      onToggle={() => togglePanel('hashtags')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('hashtags') : undefined}
    >
      <OutputItem text={hashtags} />
    </CollapsiblePanel>
  );
}

export default HashtagsPanel;
