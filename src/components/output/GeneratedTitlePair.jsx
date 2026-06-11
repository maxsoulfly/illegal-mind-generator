import CopyButton from '../CopyButton';

// Renders the title text as a clickable nav link when it was generated from
// a short hook template, so you can jump back to the source.
// Mirrors the same tag/base distinction used in ShortHookTitles.
function TitleNavLink({ titleText, sourceHook, onOpenSourceTag, onOpenSourceHook }) {
  if (!sourceHook) {
    return <p className="generated-pair-text"><strong className="saved-entry-signal">Title:</strong> {titleText}</p>;
  }

  if (sourceHook.sourceType === 'tag') {
    return (
      <button
        type="button"
        className="queue-entry-link generated-pair-text generated-pair-link"
        title={`Hook from tag: ${sourceHook.sourceTag} (${sourceHook.hookType})`}
        onClick={() => onOpenSourceTag?.({
          tagName: sourceHook.sourceTag,
          hookType: sourceHook.hookType,
          hookText: sourceHook.sourceText,
        })}
      >
        <strong className="saved-entry-signal">Title:</strong> {titleText}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="queue-entry-link generated-pair-text generated-pair-link"
      title={`Hook preset: ${sourceHook.hookType}`}
      onClick={() => onOpenSourceHook?.({
        hookType: sourceHook.hookType,
        sourceText: sourceHook.sourceText,
      })}
    >
      <strong className="saved-entry-signal">Title:</strong> {titleText}
    </button>
  );
}

function GeneratedTitlePair({ title, thumbnail, onOpenSourceTag, onOpenSourceHook }) {
  const titleText = title.text;
  const sourceHook = title.sourceHook;

  return (
    <div className="generated-pair terminal-block">
      <div className="generated-pair-row">
        <TitleNavLink
          titleText={titleText}
          sourceHook={sourceHook}
          onOpenSourceTag={onOpenSourceTag}
          onOpenSourceHook={onOpenSourceHook}
        />
        <CopyButton text={titleText} />
      </div>

      <div className="generated-pair-row">
        <p className="generated-pair-text">
          <strong className="saved-entry-signal">Thumb:</strong>{' '}
          {thumbnail}
        </p>

        <CopyButton text={thumbnail} />
      </div>
    </div>
  );
}

export default GeneratedTitlePair;
