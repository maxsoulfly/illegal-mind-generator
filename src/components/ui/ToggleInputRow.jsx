// A checkbox + label + text input row.
// The label is linked to the checkbox via id/htmlFor so clicking the label toggles it.
// The input is automatically disabled when the checkbox is unchecked.
export default function ToggleInputRow({ id, label, checked, onToggle, value, onChange, placeholder }) {
  return (
    <div className="tag-phrase-row">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        className="form-input"
        value={value}
        disabled={!checked}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
