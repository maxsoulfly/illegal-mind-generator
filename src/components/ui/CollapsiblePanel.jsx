import ToggleButton from './ToggleButton';

// Shared shell for the Generator's output panels: panel/panel-collapsed toggle,
// panel-header with title (plain h2 or a clickable nav-title button when onNavigate
// is passed), an optional extra header control, and a ToggleButton. Body only
// renders when visible — callers pass their own content as children.
export default function CollapsiblePanel({ label, visible, onToggle, onNavigate, headerExtra, children }) {
  return (
    <div className={`panel ${visible ? '' : 'panel-collapsed'}`}>
      <div className="panel-header">
        {onNavigate ? (
          <button type="button" className="panel-title panel-title--nav" onClick={onNavigate}>
            {label}
          </button>
        ) : (
          <h2 className="panel-title">{label}</h2>
        )}

        {headerExtra}

        <ToggleButton isOpen={visible} onClick={onToggle} label={label} compact />
      </div>

      {visible && children}
    </div>
  );
}
