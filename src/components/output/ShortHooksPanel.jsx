import ToggleButton from '../ToggleButton';

function ShortHooksPanel({ shortHooks, panelVisibility, togglePanel }) {
  if (!shortHooks?.length) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Short Hooks</h2>
        <ToggleButton
          isOpen={panelVisibility.titles}
          onClick={() => togglePanel('shortHooks')}
          label="Short Hooks"
          compact
        />
      </div>

      {panelVisibility.shortHooks && (
        <div className="output-list">
          {shortHooks.map((group) => (
            <div className="output-item" key={group.type}>
              <h3>{group.label}</h3>

              <ol>
                {group.hooks.map((hook) => (
                  <li key={hook}>{hook}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShortHooksPanel;
