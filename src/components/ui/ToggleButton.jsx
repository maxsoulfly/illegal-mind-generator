function ToggleButton({ isOpen, onClick, label, compact = false }) {
  const text = compact
    ? isOpen
      ? '− Hide'
      : '+ Show'
    : isOpen
      ? `− Hide ${label}`
      : `+ Show ${label}`;

  return (
    <button className="toggle-button" type="button" onClick={onClick}>
      {text}
    </button>
  );
}

export default ToggleButton;
