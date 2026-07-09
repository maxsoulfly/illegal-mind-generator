export default function ToggleField({ label, checked, onChange, title }) {
  return (
    <label className="toggle-row" title={title}>
      <input
        className="toggle-checkbox"
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
      />

      <span className="toggle-label">{label}</span>
    </label>
  );
}
