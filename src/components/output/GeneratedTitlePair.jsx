import CopyButton from '../CopyButton';

// Renders the title text as a clickable nav link when it was generated from
// a short hook template, so you can jump back to the source.
// Mirrors the same tag/base distinction used in ShortHookTitles.
function TitleNavLink({ titleText, sourceHook, sourceTemplate, onOpenSourceTag, onOpenSourceHook, onOpenSourceTemplate }) {
  if (sourceHook?.sourceType === 'tag') {
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

  if (sourceHook?.sourceType === 'base') {
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

  if (sourceTemplate) {
    return (
      <button
        type="button"
        className="queue-entry-link generated-pair-text generated-pair-link generated-pair-link--muted"
        title={`Template: ${sourceTemplate.template} (${sourceTemplate.groupName})`}
        onClick={() => onOpenSourceTemplate?.({
          groupName: sourceTemplate.groupName,
          template: sourceTemplate.template,
        })}
      >
        <strong className="saved-entry-signal">Title:</strong> {titleText}
      </button>
    );
  }

  return (
    <p className="generated-pair-text">
      <strong className="saved-entry-signal">Title:</strong> {titleText}
    </p>
  );
}

function GeneratedTitlePair({ title, thumbnail, onOpenSourceTag, onOpenSourceHook, onOpenSourceTemplate }) {
  const titleText = title.text;
  const sourceHook = title.sourceHook;
  const sourceTemplate = title.sourceTemplate;

  return (
    <div className="generated-pair terminal-block">
      <div className="generated-pair-row">
        <TitleNavLink
          titleText={titleText}
          sourceHook={sourceHook}
          sourceTemplate={sourceTemplate}
          onOpenSourceTag={onOpenSourceTag}
          onOpenSourceHook={onOpenSourceHook}
          onOpenSourceTemplate={onOpenSourceTemplate}
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
