export default function BulkTextarea({ value, onChange, onApply, onCancel }) {
  return (
    <div className="tag-section">
      <textarea
        className="form-input"
        rows={4}
        placeholder="One phrase per line"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="button-row">
        <button type="button" className="button-secondary" onClick={onApply}>
          Apply
        </button>

        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
