import { useState } from 'react';

export default function TagUsedSongList({
  songs = [],
  onLoadEntry,
  previewLimit = 3,
}) {
  const [showAllSongs, setShowAllSongs] = useState(false);

  const visibleSongs = showAllSongs ? songs : songs.slice(0, previewLimit);

  return (
    <details className="tag-song-list">
      <summary>Used in {songs.length} songs</summary>

      <div className="tag-song-links">
        {visibleSongs.map((song, index) => (
          <button
            key={`${song.artist}-${song.song}-${index}`}
            type="button"
            className="tag-song-link"
            onClick={() => onLoadEntry(song)}
          >
            <span>{song.artist}</span>
            <span>{song.song}</span>
          </button>
        ))}
      </div>

      {!showAllSongs && songs.length > previewLimit && (
        <button
          type="button"
          className="queue-entry-link tag-show-more"
          onClick={() => setShowAllSongs(true)}
        >
          +{songs.length - previewLimit} more
        </button>
      )}
    </details>
  );
}
