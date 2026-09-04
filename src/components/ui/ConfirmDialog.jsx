import { useRef, useState } from 'react';

import Modal from './Modal';
import { confirmOnEnter } from '../../utils/keyboard';

// The one confirmation dialog, driven by ConfirmProvider / useConfirm().
// Escape, backdrop click and the × / Cancel button all cancel — only the
// confirm button resolves true. Cancel takes initial focus (the safe default
// for a destructive action), but Enter always confirms regardless of which
// button is focused (confirmOnEnter, on the content wrapper — it
// preventDefaults so a focused Cancel's native Enter-activation can't also
// fire). `busy` blocks a double-submit in the brief window between the
// click and the dialog unmounting.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);
  const [busy, setBusy] = useState(false);

  function handleConfirm() {
    if (busy) return;
    setBusy(true);
    onConfirm();
  }

  function handleCancel() {
    if (busy) return;
    setBusy(true);
    onCancel();
  }

  return (
    <Modal title={title} onClose={handleCancel} initialFocusRef={cancelRef}>
      <div onKeyDown={confirmOnEnter(handleConfirm)}>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="button-secondary"
            ref={cancelRef}
            onClick={handleCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'button-secondary confirm-dialog-confirm--danger' : 'button-primary'}
            onClick={handleConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
