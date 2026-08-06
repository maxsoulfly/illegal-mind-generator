// Shared shell for the small icon-only buttons used across card headers and
// list rows (reset ↺, remove ×, lock 🔒/🔓, move ↑/↓). Pass stopPropagation
// when the button sits next to a clickable collapse-toggle header.
// nativeTooltip is a deliberate escape hatch: the themed data-tooltip popup
// can't safely render inside a genuinely scrollable ancestor (e.g. Saved
// Library's list — un-clipping it on hover would flash-unscroll the whole
// list), so those callers opt back into the plain title= attribute instead.
export default function IconButton({
  icon,
  title,
  onClick,
  disabled,
  stopPropagation = false,
  className = 'tag-reset-button',
  nativeTooltip = false,
}) {
  return (
    <button
      type="button"
      className={className}
      {...(nativeTooltip ? { title } : { 'data-tooltip': title, 'aria-label': title })}
      disabled={disabled}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        onClick?.(e);
      }}
    >
      {icon}
    </button>
  );
}
