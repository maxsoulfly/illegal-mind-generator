import { useEffect } from 'react';
function InputForm({
  formData,
  setFormData,
  onClear,
  projectConfig,
  projectOptions,
  onSaveEntry,
  savedEntries,
}) {
  const artistSuggestions = [
    ...new Set(savedEntries.map((entry) => entry.artist)),
  ]
    .filter(Boolean)
    .filter((artist) =>
      artist.toLowerCase().includes(formData.artist.toLowerCase()),
    );

  const artistValue = formData.artist.trim().toLowerCase();

  const songSuggestions = [
    ...new Set(
      savedEntries
        .filter((entry) => entry.artist.trim().toLowerCase() === artistValue)
        .map((entry) => entry.song)
        .filter(Boolean),
    ),
  ];

  useEffect(() => {
    const artistValue = formData.artist.trim().toLowerCase();
    const songValue = formData.song.trim().toLowerCase();

    const match = savedEntries.find(
      (entry) =>
        entry.artist.trim().toLowerCase() === artistValue &&
        entry.song.trim().toLowerCase() === songValue,
    );

    if (!match) return;

    setFormData((prev) => ({
      ...prev,
      signalNumber: match.signalNumber || prev.signalNumber,
    }));
  }, [formData.artist, formData.song, savedEntries, setFormData]);

  useEffect(() => {
    if (!formData.useCustomArtistShort) return;

    const words = (formData.artist || '').trim().split(' ').filter(Boolean);

    let short = formData.artist || 'ARTIST';

    if (words.length >= 3) {
      short = words.map((w) => w[0]).join('');
    }

    setFormData((prev) => ({
      ...prev,
      artistShort: short.toUpperCase(),
    }));
  }, [formData.artist, formData.useCustomArtistShort]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === 'project') {
        return {
          ...prev,
          project: value,
          transformationTags: [],
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleTagToggle = (tag) => {
    const currentTags = formData.transformationTags || [];
    const isSelected = currentTags.includes(tag);

    setFormData((prev) => {
      const prevTags = prev.transformationTags || [];

      return {
        ...prev,
        transformationTags: isSelected
          ? prevTags.filter((item) => item !== tag)
          : [...prevTags, tag],
      };
    });
  };

  return (
    <div>
      <h2>Input</h2>
      <div className="form-group">
        <label className="form-label">Project</label>
        <select
          name="project"
          className="form-select"
          value={formData.project}
          onChange={handleChange}
        >
          {projectOptions.map((project) => {
            return (
              <option key={project} value={project}>
                {project}
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Artist</label>
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
      </div>

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
          <label className="form-label">Artist Short</label>
          <input
            className="form-input"
            name="artistShort"
            placeholder="e.g. SOAD, A7X"
            value={formData.artistShort}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Song</label>
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
      </div>

      <div className="form-group">
        <label className="form-label">Signal Number</label>
        <input
          className="form-input"
          name="signalNumber"
          placeholder="Signal Number"
          value={formData.signalNumber}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Video Type</label>

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
      </div>

      <div className="form-group">
        <label className="form-label">Transformation Tags</label>

        <div className="tag-list">
          {(projectConfig.availableTags || []).map((tag) => {
            const isActive = (formData.transformationTags || []).includes(tag);

            return (
              <button
                key={tag}
                type="button"
                className={isActive ? 'tag-chip active' : 'tag-chip'}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="customStory">
          Custom Story Block
        </label>
        <textarea
          id="customStory"
          className="form-textarea"
          value={formData.customStory}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              customStory: e.target.value,
            }))
          }
          rows={5}
          placeholder="Write a custom story paragraph for the long description..."
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="customLogNote">
          Custom Log Note
        </label>
        <textarea
          id="customLogNote"
          className="form-textarea"
          value={formData.customLogNote}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              customLogNote: e.target.value,
            }))
          }
          rows={4}
          placeholder="Write a custom operator/log note..."
        />

        <label className="form-label">Additional Hashtags</label>

        <input
          type="text"
          className="form-input"
          value={formData.customHashtags || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              customHashtags: e.target.value,
            }))
          }
          placeholder="tag1, tag2, tag3"
        />
      </div>
      <div className="button-row">
        <button
          className="button-secondary"
          type="button"
          onClick={onSaveEntry}
        >
          Save Song
        </button>

        <button className="button-secondary" onClick={onClear}>
          Clear Form
        </button>
      </div>
    </div>
  );
}

export default InputForm;
