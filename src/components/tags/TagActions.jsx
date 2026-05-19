export default function TagActions({ onCreateTag }) {
  return (
    <div className="tag-actions">
      <button type="button" className="button-secondary" onClick={onCreateTag}>
        + Add tag
      </button>
    </div>
  );
}
