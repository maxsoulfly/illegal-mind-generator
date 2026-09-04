import { createContext } from 'react';

// Shared context for the app-wide confirmation dialog. Provided once by
// ConfirmProvider at the App root (mirroring how <Toast> is mounted once for
// useToast), consumed via the useConfirm() hook.
//
// The default is a safe no-op that resolves to false (cancelled) so a
// component rendered outside the provider — e.g. an isolated test — never
// crashes and never runs a destructive action.
export const ConfirmContext = createContext(() => Promise.resolve(false));
