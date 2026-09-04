import { useCallback, useRef, useState } from 'react';

import { ConfirmContext } from './confirmContext';
import ConfirmDialog from './ConfirmDialog';

// Owns the single "pending confirmation" slot for the whole app and renders
// the one <ConfirmDialog> instance. Wrap the app tree once (App.jsx). The
// caller-facing API is useConfirm().
export default function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    // If a confirm is somehow already open, resolve the stale one as
    // cancelled before replacing it — never leave a promise dangling.
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setRequest(options || {});
    });
  }, []);

  const settle = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setRequest(null);
    resolve?.(result);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <ConfirmDialog
          title={request.title}
          message={request.message}
          confirmLabel={request.confirmLabel}
          cancelLabel={request.cancelLabel}
          danger={request.danger}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}
