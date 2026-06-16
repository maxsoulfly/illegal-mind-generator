import PlaceholderField from './PlaceholderField';

// A checkbox + label + text input row.
// The label is linked to the checkbox via id/htmlFor so clicking the label toggles it.
// The input is automatically disabled when the checkbox is unchecked.
// Optional placeholders enables the {placeholder} autocomplete dropdown.
export default function ToggleInputRow({
  id,
  label,
  checked,
  onToggle,
  value,
  onChange,
  placeholder,
  placeholders,
}) {
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
      <PlaceholderField
        defaultValue={value}
        onChange={onChange}
        disabled={!checked}
        placeholder={placeholder}
        placeholders={placeholders}
      />
    </div>
  );
}
