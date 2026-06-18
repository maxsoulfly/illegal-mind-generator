// A label + range slider + current value display row.
// Shares the same tag-phrase-row layout as LabelInputRow and ToggleInputRow.
export default function LabelSliderRow({ label, value, min, max, onChange }) {
  return (
    <div className="tag-phrase-row">
      <label className="form-label">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        style={{ '--val': `${((value - min) / (max - min)) * 100}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="tag-status">{value}</span>
    </div>
  );
}
