function InputForm({
  formData,
  setFormData,
  onGenerate,
  onClear,
  projectConfig,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagToggle = (tag) => {
    const isSelected = (formData.transformationTags || []).includes(tag);

    setFormData((prev) => ({
      ...prev,
      transformationTags: isSelected
        ? prev.transformationTags.filter((item) => item !== tag)
        : [...prev.transformationTags, tag],
    }));
  };

  return (
    <div>
      <h2>Input</h2>

      <div className="form-group">
        <label className="form-label">Project</label>
        <input
          className="form-input"
          name="project"
          value={formData.project}
          onChange={handleChange}
        />
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
        <button className="button-primary" onClick={onGenerate}>
          Generate
        </button>

        <button className="button-secondary" onClick={onClear}>
          Clear Form
        </button>
      </div>
    </div>
  );
}

export default InputForm;
