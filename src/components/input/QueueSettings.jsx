import ToggleField from '../ui/ToggleField';

function QueueSettings({ excludeFromRandomizer, onToggle }) {
  return (
    <ToggleField
      label="Hide from Queue"
      checked={excludeFromRandomizer}
      onChange={onToggle}
    />
  );
}

export default QueueSettings;
