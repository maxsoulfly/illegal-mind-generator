import { useEffect } from 'react';
function InputForm({
  formData,
  setFormData,
  onClear,
  projectConfig,
  projectOptions,
  onSaveEntry,
}) {
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
        />
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
        />
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
        <select
          className="form-select"
          name="videoType"
          value={formData.videoType}
          onChange={handleChange}
        >
          <option value="Long">Long</option>
          <option value="Shorts">Shorts</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Transformation Tags</label>

        <div className="tag-list">
          {projectConfig.availableTags.map((tag) => {
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
