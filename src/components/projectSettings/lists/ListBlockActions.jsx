// Reset/Lock/Delete button trio for a list block's header. Reset only shows
// when the block has a JSON default to revert to; Lock/Delete only show when
// the block can be deleted (no JSON default), gating deletion behind isCore.
export default function ListBlockActions({
  hasOverride,
  onReset,
  onDelete,
  isCore,
  onToggleCore,
}) {
  return (
    <>
      {hasOverride && (
        <button
          type="button"
          className="tag-reset-button"
          title="Reset to default"
          onClick={(e) => { e.stopPropagation(); onReset(); }}
        >
          ↺
        </button>
      )}
      {onDelete && (
        <>
          <button
            type="button"
            className="tag-reset-button"
            title={isCore ? 'Locked — click to unlock' : 'Lock to prevent deletion'}
            onClick={(e) => { e.stopPropagation(); onToggleCore(); }}
          >
            {isCore ? '🔒' : '🔓'}
          </button>
          <button
            type="button"
            className="tag-reset-button"
            title={isCore ? 'Unlock to delete' : 'Delete this block'}
            disabled={isCore}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            ×
          </button>
        </>
      )}
    </>
  );
}
