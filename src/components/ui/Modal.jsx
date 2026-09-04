import { useCallback, useEffect, useId, useRef } from 'react';

import IconButton from './IconButton';

// This app's overlay modal. Backdrop click and Escape both close; body
// scroll locks while mounted; focus is trapped inside while open and
// returned to the triggering element on close. Mount conditionally
// ({show && <Modal>...}) — Modal has no visibility state of its own.
//
// Every other "reveal extra content on demand" case (AddTagPanel,
// CalendarEntryPicker, MissingDataTools) uses an inline expandable block
// instead. Reach for this only when the trigger must stay compact with zero
// permanent page footprint, or for a blocking prompt (see ConfirmDialog).
//
// initialFocusRef (optional): ref to the element that should receive focus
// on open. Defaults to the dialog container. ConfirmDialog points it at its
// Cancel button.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, onClose, children, initialFocusRef }) {
  const contentRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const titleId = useId();
  const close = useCallback(() => onCloseRef.current(), []);

  useEffect(() => {
    // Capture what to restore focus to — guarded so StrictMode's
    // double-invoke (or any effect re-run) can't overwrite it with an
    // element inside the modal.
    if (!restoreFocusRef.current) {
      restoreFocusRef.current = document.activeElement;
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusable = Array.from(
        contentRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) {
        e.preventDefault();
        contentRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const outside = !contentRef.current.contains(active);

      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    (initialFocusRef?.current || contentRef.current)?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      const toRestore = restoreFocusRef.current;
      if (toRestore instanceof HTMLElement && toRestore.isConnected) {
        toRestore.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: focus capture/trap/restore and scroll-lock must not re-run on re-render; the latest onClose is read via onCloseRef
  }, []);

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        ref={contentRef}
        className="modal-content terminal-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="panel-title" id={titleId}>{title}</h3>
          <IconButton icon="×" title="Close" onClick={close} />
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
