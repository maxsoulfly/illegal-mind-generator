import ToggleButton from '../ui/ToggleButton';
import CopyButton from '../CopyButton';
import ShortHookTitles from './ShortHookTitles';

function ShortHooksPanel({
  shortHooks,
  panelVisibility,
  togglePanel,
  onOpenSourceTag,
}) {
  if (!shortHooks?.length) return null;

  return (
    <div
      className={`panel ${panelVisibility.shortHooks ? '' : 'panel-collapsed'}`}
    >
      <div className="panel-header">
        <h2 className="panel-title">Short Hooks</h2>
        <ToggleButton
          isOpen={panelVisibility.shortHooks}
          onClick={() => togglePanel('shortHooks')}
          label="Short Hooks"
          compact
        />
      </div>

      {panelVisibility.shortHooks && (
        <div>
          {shortHooks.map((group) => (
            <ShortHookTitles
              key={group.type}
              title={group.label}
              hooks={group.hooks}
              onOpenSourceTag={onOpenSourceTag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShortHooksPanel;
