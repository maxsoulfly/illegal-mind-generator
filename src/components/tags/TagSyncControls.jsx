export default function TagSyncControls({
  projects,
  syncTargetProjectId,
  setSyncTargetProjectId,
  onSyncTags,
}) {
  return (
    <div className="tag-actions">
      <select
        className="form-select"
        value={syncTargetProjectId}
        onChange={(event) => setSyncTargetProjectId(event.target.value)}
      >
        {projects.map(([destinationProjectId, destinationProject]) => (
          <option key={destinationProjectId} value={destinationProjectId}>
            {destinationProject.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="button-secondary"
        onClick={onSyncTags}
        disabled={!syncTargetProjectId}
      >
        Sync Tags
      </button>
    </div>
  );
}