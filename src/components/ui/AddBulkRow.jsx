export default function AddBulkRow({ onAdd, onBulk }) {
  return (
    <div className="button-row">
      <button type="button" className="button-secondary" onClick={onAdd}>
        + Add
      </button>

      <button type="button" className="button-secondary" onClick={onBulk}>
        + Bulk
      </button>
    </div>
  );
}
