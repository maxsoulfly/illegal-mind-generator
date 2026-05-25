export default function TagStatusChip({
  label,
  active = true,
  activeText = '✓',
  inactiveText = '—',
  variant,
}) {
  const statusClass = variant || (active ? 'mapped' : 'missing');

  return (
    <span className={`tag-status-chip ${statusClass}`}>
      {label}
      {activeText || inactiveText
        ? `: ${active ? activeText : inactiveText}`
        : ''}
    </span>
  );
}
