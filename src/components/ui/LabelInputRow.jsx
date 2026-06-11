// A label + text input row, without a toggle checkbox.
// Shares the same tag-phrase-row layout as ToggleInputRow for visual consistency.
// Pass compact={true} for short-value inputs like separators or connectors.
export default function LabelInputRow({ label, value, onChange, placeholder, compact }) {
  return (
    <div className="tag-phrase-row">
      <label className="form-label">{label}</label>
      <input
        className={`form-input${compact ? ' form-input--compact' : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
