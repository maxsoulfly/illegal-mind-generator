// This app's second "renders outside normal flow" primitive, after Modal —
// unlike Modal, always mounted (cheap, nothing to avoid mounting) rather
// than conditionally rendered by the caller. Replaces window.alert() for
// fire-and-forget success/info messages that don't need a user response.
// key={toast.id} forces a remount on every new toast (including back-to-back
// ones with identical text), restarting the CSS fade-in/out animation.
export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div key={toast.id} className="toast terminal-block" role="status">
      {toast.message}
    </div>
  );
}
