import IconButton from './IconButton';

export default function AddBulkRow({ onAdd, onBulk }) {
  return (
    <div className="button-row">
      <IconButton icon="+ Add" className="button-secondary" onClick={onAdd} />
      <IconButton icon="+ Bulk" className="button-secondary" onClick={onBulk} />
    </div>
  );
}
