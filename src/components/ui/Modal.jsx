import { useEffect } from 'react';

import IconButton from './IconButton';

// This app's first overlay modal — every other "reveal extra content on
// demand" case (AddTagPanel, CalendarEntryPicker, MissingDataTools) uses an
// inline expandable block instead, since nothing needed the trigger to stay
// fully compact with zero permanent page footprint until now. Use this only
// when that's genuinely the requirement — default to an inline panel
// otherwise, matching every existing precedent.
export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content terminal-block" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="panel-title">{title}</h3>
          <IconButton icon="×" title="Close" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
