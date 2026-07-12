// Mirrors DescriptionLineLink/ThumbnailNavLink's inline nav-link pattern: branch
// on the entry's source shape, fall back to plain (non-interactive) text when
// there's nothing to navigate to. Shared by HashtagsPanel and YouTubeTagsPanel
// since both render the same {text, source} entry shape from generateHashtags.js.
export default function HashtagLink({
  entry,
  onOpenSourceTag,
  onOpenSourceHashtag,
  onOpenSongOverride,
  className = 'hashtag-chip-link',
}) {
  const { text, source } = entry;

  if (source?.type === 'tag') {
    const detail = source.phrase ? `: "${source.phrase}"` : ' — tag name used as hashtag';

    return (
      <span
        className={className}
        title={`${source.tagName} (hashtags)${detail}`}
        onClick={() => onOpenSourceTag?.({ tagName: source.tagName, field: 'hashtags', phraseText: source.phrase })}
      >
        {text}
      </span>
    );
  }

  if (source?.type === 'base') {
    const cardLabel = source.card === 'youtubeTagsBase' ? 'Base YouTube Tags' : 'Base Hashtags';

    return (
      <span
        className={className}
        title={`Hashtags & YouTube Tags → ${cardLabel}: "${source.phrase}"`}
        onClick={() => onOpenSourceHashtag?.({ card: source.card, template: source.phrase })}
      >
        {text}
      </span>
    );
  }

  if (source?.type === 'override') {
    return (
      <span
        className={className}
        title="Additional Hashtags (this song)"
        onClick={() => onOpenSongOverride?.({ blockKey: 'customHashtags' })}
      >
        {text}
      </span>
    );
  }

  return <span>{text}</span>;
}
