// Shared row shape for SavedLibrary, ShortsQueue, and Todo list items.
// `middle` and `actions` let each caller slot in its own extra content/controls
// without duplicating the signal/title/tags markup three times.
export default function SavedEntryRow({
  signal,
  artist,
  song,
  onTitleClick,
  tags,
  hidden,
  loading,
  badges,
  middle,
  actions,
  actionsClassName,
}) {
  return (
    <div className={`saved-entry-row terminal-block${loading ? ' saved-entry-loading' : ''}`}>
      <div className="saved-entry-main">
        <span className="saved-entry-signal">{signal}.</span>

        <button
          type="button"
          className="queue-entry-link saved-entry-text"
          onClick={onTitleClick}
        >
          <strong>{artist}</strong> — {song}
        </button>

        {tags?.length > 0 && (
          <span className="saved-entry-tags">[{tags.join(', ')}]</span>
        )}

        {hidden && <span className="saved-entry-hidden">[hidden]</span>}

        {badges}
      </div>

      {middle}

      <div className={`saved-entry-actions${actionsClassName ? ` ${actionsClassName}` : ''}`}>
        {actions}
      </div>
    </div>
  );
}
