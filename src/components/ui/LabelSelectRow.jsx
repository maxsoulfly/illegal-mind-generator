// Label + select row, same tag-phrase-row layout as LabelInputRow.
// Pass compact={true} for short-value selects like type pickers.
export default function LabelSelectRow({ label, value, onChange, options, compact }) {
  return (
    <div className="tag-phrase-row">
      <label className="form-label">{label}</label>
      <select
        className={`form-select${compact ? ' form-select--compact' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
