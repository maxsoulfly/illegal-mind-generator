export default function ToggleField({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <input
        className="toggle-checkbox"
        type="checkbox"
        defaultChecked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
      />

      <span className="toggle-label">{label}</span>
    </label>
  );
}
