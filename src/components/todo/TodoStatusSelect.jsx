export default function TodoStatusSelect({
  value = '',
  statuses = [],
  onChange,
}) {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">None</option>

      {statuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
