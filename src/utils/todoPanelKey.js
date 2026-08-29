// Shared between TodoStatusSection (reads panelVisibility) and TodoPage
// (force-opens a section when navigating here from a Saved Library badge) —
// kept in its own file since a component file can only export components
// under this project's react-refresh lint rule.
export function buildTodoStatusPanelKey(status) {
  return `todoStatus_${status
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')}`;
}
