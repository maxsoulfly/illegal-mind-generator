import IconButton from './IconButton';

// `extra` renders as an extra control in the same row, after + Bulk (used by
// CoverShortHooksEditor for its "Copy AI Prompt" button).
export default function AddBulkRow({ onAdd, onBulk, extra }) {
  return (
    <div className="button-row">
      <IconButton icon="+ Add" className="button-secondary" onClick={onAdd} />
      <IconButton icon="+ Bulk" className="button-secondary" onClick={onBulk} />
      {extra}
    </div>
  );
}
