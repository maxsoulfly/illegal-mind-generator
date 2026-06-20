function QueueSettings({ excludeFromRandomizer, onToggle }) {
  return (
    <div className="form-group">
      <label className="toggle-checkbox">
        <input
          type="checkbox"
          checked={excludeFromRandomizer}
          onChange={(e) => onToggle(e.target.checked)}
        />
        Hide from Queue
      </label>
    </div>
  );
}

export default QueueSettings;
