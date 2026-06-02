import { useState } from 'react';

import ToggleButton from '../ui/ToggleButton';
function parseSongLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)\s(?:--|—|–|-)\s(.+)$/);

      if (!match) return null;

      return {
        artist: match[1].trim(),
        song: match[2].trim(),
      };
    })
    .filter(Boolean);
}

export default function BulkSongEntry({
  title = 'Bulk Add Songs',
  buttonLabel = 'Add Songs',
  placeholder = 'Artist – Song',
  onAddSongs,
  isOpen = false,
  onToggle,
}) {
  const [text, setText] = useState('');

  const parsedSongs = parseSongLines(text);

  function handleAddSongs() {
    if (parsedSongs.length === 0) return;

    onAddSongs(parsedSongs);
    setText('');
  }

  return (
    <div className="terminal-block bulk-song-entry">
      <ToggleButton isOpen={isOpen} onClick={onToggle} label={title} />

      {isOpen && (
        <>
          <textarea
            className="form-textarea"
            value={text}
            rows={6}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="bulk-song-entry-actions">
            <span className="muted-text">
              {parsedSongs.length} valid song
              {parsedSongs.length === 1 ? '' : 's'} found
            </span>

            <button
              type="button"
              className="button-secondary"
              disabled={parsedSongs.length === 0}
              onClick={handleAddSongs}
            >
              {buttonLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
