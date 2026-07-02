import IconButton from '../ui/IconButton';
import SavedEntryRow from '../ui/SavedEntryRow';

function ShortsQueueItem({ entry, index, onLoadEntry, onUploaded }) {
  return (
    <SavedEntryRow
      signal={(index + 1).toString().padStart(2, '0')}
      artist={entry.artist}
      song={entry.song}
      onTitleClick={() => onLoadEntry(entry)}
      tags={entry.transformationTags?.slice(0, 2)}
      actions={
        <IconButton
          icon="×"
          className="button-secondary"
          onClick={onUploaded}
        />
      }
    />
  );
}

export default ShortsQueueItem;
