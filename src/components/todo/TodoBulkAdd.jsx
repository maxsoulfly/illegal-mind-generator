import BulkSongEntry from '../shared/BulkSongEntry';

export default function TodoBulkAdd({
  savedEntries = [],
  todoStatuses = [],
  onAddEntries,
  isOpen,
  onToggle,
}) {
  const defaultStatus = todoStatuses[0] || 'Wishlist';

  function handleBulkAddWishlistSongs(songs) {
    const newEntries = songs
      .filter(({ artist, song }) => {
        return !savedEntries.some(
          (entry) =>
            entry.artist?.toLowerCase() === artist.toLowerCase() &&
            entry.song?.toLowerCase() === song.toLowerCase(),
        );
      })
      .map(({ artist, song }) => ({
        artist,
        song,
        signalNumber: '',
        videoType: 'short',
        transformationTags: [],
        excludeFromRandomizer: true,
        todo: {
          status: defaultStatus,
          notes: '',
        },
      }));

    if (newEntries.length === 0) return;

    onAddEntries(newEntries);
  }

  return (
    <BulkSongEntry
      title={`Bulk Add ${defaultStatus} Covers`}
      buttonLabel={`Add to ${defaultStatus}`}
      placeholder={`Thrice – The Artist in the Ambulance
The Offspring – Gotta Get Away
Papa Roach – Blood Brothers`}
      isOpen={isOpen}
      onToggle={onToggle}
      onAddSongs={handleBulkAddWishlistSongs}
    />
  );
}
