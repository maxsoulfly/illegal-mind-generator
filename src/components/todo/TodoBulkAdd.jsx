import BulkSongEntry from '../shared/BulkSongEntry';

export default function TodoBulkAdd({
  savedEntries = [],
  onAddEntries,
  isOpen,
  onToggle,
}) {
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
        excludeFromRandomizer: false,
        todo: {
          status: 'Wishlist',
          notes: '',
        },
      }));

    if (newEntries.length === 0) return;

    onAddEntries(newEntries);
  }

  return (
    <BulkSongEntry
      title="Bulk Add Wishlist Covers"
      buttonLabel="Add to Wishlist"
      placeholder={`Thrice – The Artist in the Ambulance
The Offspring – Gotta Get Away
Papa Roach – Blood Brothers`}
      isOpen={isOpen}
      onToggle={onToggle}
      onAddSongs={handleBulkAddWishlistSongs}
    />
  );
}
