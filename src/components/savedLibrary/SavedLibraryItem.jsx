import { useState } from 'react';
import IconButton from '../ui/IconButton';
import SavedEntryRow from '../ui/SavedEntryRow';

function SavedLibraryItem({ entry, onLoadEntry, onDeleteEntry }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = () => {
    setIsLoading(true);

    window.setTimeout(() => {
      onLoadEntry(entry);
    }, 200);
  };

  return (
    <SavedEntryRow
      signal={(entry.signalNumber || '--').toString().padStart(2, '0')}
      artist={entry.artist}
      song={entry.song}
      onTitleClick={handleLoad}
      tags={entry.transformationTags}
      hidden={entry.excludeFromRandomizer}
      loading={isLoading}
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
