import { useState } from 'react';
import LabelSelectRow from '../ui/LabelSelectRow';

export default function InputFormActions({
  onSaveEntry,
  onClear,
  projectId,
  projects,
}) {
  const [targetProjectId, setTargetProjectId] = useState(projectId);

  const projectOptions = Object.entries(projects).map(([id, project]) => ({
    value: id,
    label: project.name,
  }));

  return (
    <div>
      <LabelSelectRow
        label="Save to"
        value={targetProjectId}
        onChange={setTargetProjectId}
        options={projectOptions}
        compact
      />

      <div className="button-row">
        <button className="button-secondary" type="button" onClick={() => onSaveEntry(targetProjectId)}>
          Save
        </button>

        <button className="button-secondary" onClick={onClear}>
          Clear Form
        </button>
      </div>
    </div>
  );
}
