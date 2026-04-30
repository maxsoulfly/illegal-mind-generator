function ToggleButton({ isOpen, onClick, label }) {
  return (
    <button className="toggle-button" onClick={onClick}>
      {isOpen ? `− Hide ${label}` : `+ Show ${label}`}
    </button>
  );
}

export default ToggleButton;
