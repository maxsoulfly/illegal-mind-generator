import FormField from '../ui/FormField';

export default function BasicSongFields({
  formData,
  setFormData,
  handleChange,
  artistSuggestions,
  songSuggestions,
}) {
  return (
    <div className="basic-song-fields">
      <div className="form-group">
        <FormField label="Artist">
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
          <label className="toggle-row">
            <input
              className="toggle-checkbox"
              type="checkbox"
              name="useCustomArtistShort"
              checked={formData.useCustomArtistShort}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  useCustomArtistShort: e.target.checked,
                }))
              }
            />
            <span className="toggle-label">Use custom artist short</span>
          </label>

          {formData.useCustomArtistShort && (
            <div className="form-group">
              <FormField label="Artist Short">
                <input
                  className="form-input"
                  name="artistShort"
                  placeholder="e.g. SOAD, A7X"
                  value={formData.artistShort}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          )}
        </FormField>
      </div>

      <div className="form-group">
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
            {[...new Set(songSuggestions)].map((song) => (
              <option key={song} value={song} />
            ))}
          </datalist>
        </FormField>
      </div>

      <div className="form-group">
        <FormField label="Signal Number">
          <input
            className="form-input"
            name="signalNumber"
            placeholder="Signal Number"
            value={formData.signalNumber}
            onChange={handleChange}
          />
        </FormField>
      </div>

      <div className="form-group">
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
    </div>
  );
}
