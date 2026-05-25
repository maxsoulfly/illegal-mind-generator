import ToggleButton from '../ToggleButton';
import CopyButton from '../CopyButton';

function ShortHooksPanel({ shortHooks, panelVisibility, togglePanel }) {
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
            <div key={group.type} className="generated-pair terminal-block">
              <h3 className="saved-entry-signal">{group.label}</h3>

              {group.hooks.map((hook, index) => (
                <div key={index} className="generated-pair-row">
                  <p className="generated-pair-text">{hook}</p>

                  <CopyButton text={hook} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShortHooksPanel;
