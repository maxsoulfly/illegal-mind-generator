import CopyButton from '../CopyButton';
import NavLinkButton from '../ui/NavLinkButton';
import CollapsiblePanel from '../ui/CollapsiblePanel';

const CARD_LABELS = {
  words: 'Words',
  fallbacks: 'Fallbacks',
  genericTagTemplates: 'Generic Tag Templates',
};

function ThumbnailNavLink({ text, source, onOpenSourceThumbnail, onOpenSourceTag }) {
  if (source?.type === 'tag') {
    return (
      <NavLinkButton
        title={`${source.tagName} (thumbnail): "${source.phrase}"`}
        onClick={() => onOpenSourceTag?.({ tagName: source.tagName, field: 'thumbnail', phraseText: source.phrase })}
      >
        {text}
      </NavLinkButton>
    );
  }

  if (source?.type === 'genericTagTemplates') {
    return (
      <NavLinkButton
        muted
        title={`Thumbnail Templates → Generic Tag Templates: "${source.template}"`}
        onClick={() => onOpenSourceThumbnail?.({ card: source.type, template: source.template })}
      >
        {text}
      </NavLinkButton>
    );
  }

  if (source?.type === 'words' || source?.type === 'fallbacks') {
    return (
      <NavLinkButton
        muted={source.type !== 'words'}
        title={`Thumbnail Templates → ${CARD_LABELS[source.type]}: "${source.phrase}"`}
        onClick={() => onOpenSourceThumbnail?.({ card: source.type, template: source.phrase })}
      >
        {text}
      </NavLinkButton>
    );
  }

  return <p className="generated-pair-text">{text}</p>;
}

function ThumbnailsPanel({ thumbnails, panelVisibility, togglePanel, onOpenSourceThumbnail, onOpenSourceTag, onNavigateToSettings }) {
  if (!thumbnails?.length) return null;

  return (
    <CollapsiblePanel
      label="Thumbnails"
      visible={panelVisibility.thumbnails}
      onToggle={() => togglePanel('thumbnails')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('thumbnails') : undefined}
    >
      {thumbnails.map((thumbnail, index) => (
        <div key={index} className="generated-pair terminal-block">
          <div className="generated-pair-row">
            <ThumbnailNavLink
              text={thumbnail.text}
              source={thumbnail.source}
              onOpenSourceThumbnail={onOpenSourceThumbnail}
              onOpenSourceTag={onOpenSourceTag}
            />
            <CopyButton text={thumbnail.text} />
          </div>
        </div>
      ))}
    </CollapsiblePanel>
  );
}

export default ThumbnailsPanel;
