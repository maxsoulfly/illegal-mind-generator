// Shared shell for the small icon-only buttons used across card headers and
// list rows (reset ↺, remove ×, lock 🔒/🔓, move ↑/↓). Pass stopPropagation
// when the button sits next to a clickable collapse-toggle header.
export default function IconButton({
  icon,
  title,
  onClick,
  disabled,
  stopPropagation = false,
  className = 'tag-reset-button',
}) {
  return (
    <button
      type="button"
      className={className}
      title={title}
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
