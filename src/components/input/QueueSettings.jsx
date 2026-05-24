function QueueSettings({ excludeFromRandomizer, onToggle }) {
  return (
    <div className="form-group">
      <label>QUEUE BEHAVIOR</label>

      <label className="checkbox-label">
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
