import { useState } from 'react';

export default function InputFormActions({
  onSaveEntry,
  onClear,
  projectId,
  projects,
}) {
  const [targetProjectId, setTargetProjectId] = useState(projectId);

  return (
    <div>
      <div className="tag-actions">
        <select
          className="form-select"
          value={targetProjectId}
          onChange={(e) => setTargetProjectId(e.target.value)}
        >
          {Object.entries(projects).map(([id, project]) => (
            <option key={id} value={id}>{project.name}</option>
          ))}
        </select>

        <button className="button-secondary" type="button" onClick={() => onSaveEntry(targetProjectId)}>
          Save
        </button>
      </div>

      <div className="button-row">
        <button className="button-secondary" onClick={onClear}>
          Clear Form
        </button>
      </div>
    </div>
  );
}
