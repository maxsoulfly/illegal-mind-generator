import { useContext } from 'react';

import { ConfirmContext } from '../components/ui/confirmContext';

// Returns confirm(options) -> Promise<boolean>. Resolves true ONLY when the
// user clicks the confirm button; Escape / backdrop click / the × / Cancel
// all resolve false, so a destructive action can never run on a cancel.
//
// Mirrors useToast(): the pending state and the rendered dialog live in one
// provider at the App root — callers just get the function.
//
//   const confirm = useConfirm();
//   if (!(await confirm({
//     title: 'Delete block',
//     message: 'Delete "Intro"? This cannot be undone.',
//     confirmLabel: 'Delete',
//   }))) return;
//
// options: { title, message, confirmLabel?, cancelLabel?, danger? }
//   confirmLabel defaults to 'Confirm', cancelLabel to 'Cancel',
//   danger to true (destructive styling on the confirm button).
export default function useConfirm() {
  return useContext(ConfirmContext);
}
