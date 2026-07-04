import FormField from '../ui/FormField';
import ToggleField from '../ui/ToggleField';

export default function BasicSongFields({
  formData,
  setFormData,
  handleChange,
  artistSuggestions,
  songSuggestions,
}) {
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
          />
        </FormField>
      </div>

      <FormField label="Original Genre">
        <input
          className="form-input"
          name="originalGenre"
          placeholder="e.g. Dance Pop, New Wave"
          value={formData.originalGenre}
          onChange={handleChange}
        />
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
