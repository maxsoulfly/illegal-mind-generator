import { useState } from 'react';
import FormField from '../ui/FormField';
import ToggleField from '../ui/ToggleField';
import { buildSearchQuery } from '../../utils/searchQuery';

// Genre names that legitimately contain " and "/"/" as part of the name
// itself, not as a separator between two genres -- protected from the
// separator normalization below (e.g. "Rock and Roll" should stay one
// genre, not become "Rock, Roll").
const GENRE_AND_EXCEPTIONS = ['rock and roll', 'rhythm and blues', 'drum and bass'];

// Non-whitespace sentinel (\u0000, a control character that can't appear
// in real genre text) -- survives the whitespace/comma collapsing and the
// final trim() no matter where in the string the protected phrase falls.
// A space-padded placeholder would not survive: it breaks when the phrase
// lands at the very end, since trim() strips the trailing space before the
// restore step gets a chance to match it.
const placeholderToken = (i) => '\u0000' + i + '\u0000';

// Normalizes "Skate Punk / Pop-Punk" or "Skate Punk and Pop-Punk" into
// "Skate Punk, Pop-Punk" so pasted/typed genre lists read consistently,
// without touching genre names from GENRE_AND_EXCEPTIONS.
function normalizeGenreSeparators(text) {
  if (!text) return text;

  const placeholders = [];
  let result = text;

  GENRE_AND_EXCEPTIONS.forEach((exception) => {
    const re = new RegExp(exception.replace(/ /g, '\\s+'), 'gi');
    result = result.replace(re, (match) => {
      placeholders.push(match);
      return placeholderToken(placeholders.length - 1);
    });
  });

  result = result
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+and\s+/gi, ', ')
    .replace(/\s*,\s*/g, ', ')
    .trim();

  placeholders.forEach((original, i) => {
    result = result.replace(placeholderToken(i), original);
  });

  return result;
}

export default function BasicSongFields({
  formData,
  setFormData,
  handleChange,
  artistSuggestions,
  songSuggestions,
}) {
  const [copiedField, setCopiedField] = useState(null);

  const copySearchQuery = (kind) => {
    const query = buildSearchQuery(kind, formData.artist, formData.song);
    if (!query) return;

    navigator.clipboard.writeText(query);
    setCopiedField(kind);
    setTimeout(() => setCopiedField(null), 500);
  };

  const handleGenreBlur = () => {
    const normalized = normalizeGenreSeparators(formData.originalGenre);
    if (normalized !== formData.originalGenre) {
      setFormData((prev) => ({ ...prev, originalGenre: normalized }));
    }
  };

  return (
    <div className="basic-song-fields">
      <FormField label="Artist" className="basic-song-fields__artist-group">
        <input
          className="form-input"
          name="artist"
          placeholder="Artist"
          value={formData.artist}
          onChange={handleChange}
          list="artist-suggestions"
        />
        <datalist id="artist-suggestions">
          {artistSuggestions.map((artist) => (
            <option key={artist} value={artist} />
          ))}
        </datalist>
        <ToggleField
          label="Use custom artist short"
          checked={formData.useCustomArtistShort}
          onChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              useCustomArtistShort: checked,
            }))
          }
        />

        {formData.useCustomArtistShort && (
          <FormField label="Artist Short">
            <input
              className="form-input"
              name="artistShort"
              placeholder="e.g. SOAD, A7X"
              value={formData.artistShort}
              onChange={handleChange}
            />
          </FormField>
        )}
      </FormField>

      <FormField label="Song">
        <input
          className="form-input"
          name="song"
          placeholder="Song"
          value={formData.song}
          onChange={handleChange}
          list="song-suggestions"
        />
        <datalist id="song-suggestions">
          {/* Dedup: same song title appears across different artists in the library. */}
          {[...new Set(songSuggestions)].map((song) => (
            <option key={song} value={song} />
          ))}
        </datalist>
      </FormField>

      <div className="form-row">
        <FormField label="Signal Number">
          <input
            className="form-input"
            name="signalNumber"
            placeholder="e.g. 042"
            value={formData.signalNumber}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Year">
          <input
            className="form-input"
            name="originalYear"
            placeholder="e.g. 1983"
            value={formData.originalYear}
            onChange={handleChange}
            onDoubleClick={() =>
              !formData.originalYear && copySearchQuery('year')
            }
            title={
              formData.originalYear
                ? undefined
                : "Double-click to copy a Google search for this song's release date"
            }
          />
          {copiedField === 'year' && (
            <span className="field-copy-hint">Copied ✔️</span>
          )}
        </FormField>
      </div>

      <FormField label="Original Genre">
        <input
          className="form-input"
          name="originalGenre"
          placeholder="e.g. Dance Pop, New Wave"
          value={formData.originalGenre}
          onChange={handleChange}
          onBlur={handleGenreBlur}
          onDoubleClick={() =>
            !formData.originalGenre && copySearchQuery('genre')
          }
          title={
            formData.originalGenre
              ? undefined
              : "Double-click to copy a Google search for this song's genre"
          }
        />
        {copiedField === 'genre' && (
          <span className="field-copy-hint">Copied ✔️</span>
        )}
      </FormField>

      <FormField label="Video Type">
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="videoType"
              value="Long"
              checked={formData.videoType === 'Long'}
              onChange={handleChange}
            />
            <span>Long</span>
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="videoType"
              value="Shorts"
              checked={formData.videoType === 'Shorts'}
              onChange={handleChange}
            />
            <span>Shorts</span>
          </label>
        </div>
      </FormField>
    </div>
  );
}
