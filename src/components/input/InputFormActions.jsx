export default function InputFormActions({
  onSaveEntry,
  onClear,
  projectName,
}) {
  return (
    <div className="button-row">
      <button className="button-secondary" type="button" onClick={onSaveEntry}>
        Save to&nbsp;
        <span className="text-accent-soft">{projectName}</span>
      </button>

      <button className="button-secondary" onClick={onClear}>
        Clear Form
      </button>
    </div>
  );
}
