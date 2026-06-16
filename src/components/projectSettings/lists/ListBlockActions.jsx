import IconButton from '../../ui/IconButton';

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
        <IconButton
          icon="↺"
          title="Reset to default"
          stopPropagation
          onClick={onReset}
        />
      )}
      {onDelete && (
        <>
          <IconButton
            icon={isCore ? '🔒' : '🔓'}
            title={isCore ? 'Locked — click to unlock' : 'Lock to prevent deletion'}
            stopPropagation
            onClick={onToggleCore}
          />
          <IconButton
            icon="×"
            title={isCore ? 'Unlock to delete' : 'Delete this block'}
            disabled={isCore}
            stopPropagation
            onClick={onDelete}
          />
        </>
      )}
    </>
  );
}
