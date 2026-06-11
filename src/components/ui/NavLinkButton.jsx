// Inline clickable text button used to navigate back to a generated output's source.
// Used in title pairs and short hook lists to link generated text to its origin.
export default function NavLinkButton({ children, title, onClick, muted }) {
  return (
    <button
      type="button"
      className={`queue-entry-link generated-pair-text generated-pair-link${muted ? ' generated-pair-link--muted' : ''}`}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
