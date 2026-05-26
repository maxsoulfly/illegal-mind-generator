import { useState } from 'react';
import TagMapStatus from './TagMapStatus';

export default function TagDetails({ tag, onLoadEntry }) {
  const [showAllSongs, setShowAllSongs] = useState(false);

  const visibleSongs = showAllSongs
    ? tag.usedBySongs
    : tag.usedBySongs.slice(0, 3);

  return (
    <details className="tag-section">
      <summary>Tag info</summary>

      <div className="tag-editor-nested-section">
        <TagMapStatus existsIn={tag.existsIn} tag={tag} />

        <details className="tag-song-list">
          <summary>Used in {tag.usedBySongs.length} songs</summary>

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

          {!showAllSongs && tag.usedBySongs.length > 3 && (
            <button
              type="button"
              className="queue-entry-link tag-show-more"
              onClick={() => setShowAllSongs(true)}
            >
              +{tag.usedBySongs.length - 3} more
            </button>
          )}
        </details>
      </div>
    </details>
  );
}
