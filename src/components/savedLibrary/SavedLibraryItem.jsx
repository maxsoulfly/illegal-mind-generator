import { useState } from 'react';
import IconButton from '../ui/IconButton';
import SavedEntryRow from '../ui/SavedEntryRow';
import { buildSearchQuery } from '../../utils/searchQuery';

function SavedLibraryItem({ entry, onLoadEntry, onDeleteEntry }) {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(null);

  const handleLoad = () => {
    setIsLoading(true);

    window.setTimeout(() => {
      onLoadEntry(entry);
    }, 200);
  };

  const copyMissingBadge = (kind) => {
    const query = buildSearchQuery(kind, entry.artist, entry.song);
    if (!query) return;

    navigator.clipboard.writeText(query);
    setCopiedBadge(kind);
    setTimeout(() => setCopiedBadge(null), 500);
  };

  const missingBadges = (
    <>
      {!entry.originalYear && (
        <IconButton
          icon={copiedBadge === 'year' ? 'copied ✔️' : 'year'}
          title="Copy a Google search for this song's release date"
          className="saved-entry-missing-badge"
          stopPropagation
          onClick={() => copyMissingBadge('year')}
        />
      )}
      {!entry.originalGenre && (
        <IconButton
          icon={copiedBadge === 'genre' ? 'copied ✔️' : 'genre'}
          title="Copy a Google search for this song's genre"
          className="saved-entry-missing-badge"
          stopPropagation
          onClick={() => copyMissingBadge('genre')}
        />
      )}
    </>
  );

  return (
    <SavedEntryRow
      signal={(entry.signalNumber || '--').toString().padStart(2, '0')}
      artist={entry.artist}
      song={entry.song}
      onTitleClick={handleLoad}
      tags={entry.transformationTags}
      hidden={entry.excludeFromRandomizer}
      loading={isLoading}
      badges={missingBadges}
      actions={
        <IconButton
          icon="×"
          className="button-secondary"
          onClick={() => onDeleteEntry(entry.id)}
        />
      }
    />
  );
}

export default SavedLibraryItem;
