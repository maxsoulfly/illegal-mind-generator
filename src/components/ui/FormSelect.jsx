// The standard form-select dropdown (same style as TodoStatusSelect),
// wrapped to stop click propagation by default since it's typically used
// inside clickable card headers (e.g. collapse toggles).
export default function FormSelect({ value, onChange, options, onClick }) {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
