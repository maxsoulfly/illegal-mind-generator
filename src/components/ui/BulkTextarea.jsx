import PlaceholderField from './PlaceholderField';

export default function BulkTextarea({ value, onChange, onApply, onCancel, placeholders }) {
  return (
    <div className="tag-section">
      <PlaceholderField
        multiline
        className="form-input"
        rows={4}
        placeholder="One phrase per line"
        defaultValue={value}
        onChange={onChange}
        placeholders={placeholders}
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
