import { useCallback, useRef, useState } from 'react';

const TOAST_DURATION_MS = 3000;

// A second showToast() call before the first one's timer fires must clear
// that pending timeout — otherwise the earlier timer would still fire and
// clear a toast that isn't its own, cutting the newer message's display
// time short.
export default function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, id: Date.now() });
    timeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  return { toast, showToast };
}
