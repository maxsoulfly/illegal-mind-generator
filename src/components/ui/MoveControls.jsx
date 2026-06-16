import IconButton from './IconButton';

// Up/down reorder button pair, disabled at the start/end of a list.
// Pass className for context-specific layout tweaks (see .desc-block-move-controls).
export default function MoveControls({
  disabledUp,
  disabledDown,
  onMoveUp,
  onMoveDown,
  className,
}) {
  return (
    <div className={`move-controls${className ? ` ${className}` : ''}`}>
      <IconButton icon="↑" title="Move up" disabled={disabledUp} onClick={onMoveUp} />
      <IconButton icon="↓" title="Move down" disabled={disabledDown} onClick={onMoveDown} />
    </div>
  );
}
