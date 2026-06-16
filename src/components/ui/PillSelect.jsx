// A pill-styled select dropdown (links-editor-badge-select). Stops click
// propagation by default since it's typically used inside clickable card
// headers (e.g. collapse toggles).
export default function PillSelect({ value, onChange, options, onClick }) {
  return (
    <select
      className="links-editor-badge-select"
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
