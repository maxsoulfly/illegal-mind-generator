function InputForm({ formData, setFormData, onGenerate }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <h2>Input</h2>

      <label>Project</label>
      <br />
      <input
        name="project"
        value={formData.project}
        onChange={handleChange}
      />
      <br />

      <label>Artist</label>
      <br />
      <input
        name="artist"
        placeholder="Artist"
        value={formData.artist}
        onChange={handleChange}
      />
      <br />

      <label>Song</label>
      <br />
      <input
        name="song"
        placeholder="Song"
        value={formData.song}
        onChange={handleChange}
      />
      <br />

      <label>Signal Number</label>
      <br />
      <input
        name="signalNumber"
        placeholder="Signal Number"
        value={formData.signalNumber}
        onChange={handleChange}
      />
      <br />

      <label>Video Type</label>
      <br />
      <select
        name="videoType"
        value={formData.videoType}
        onChange={handleChange}
      >
        <option value="Long">Long</option>
        <option value="Shorts">Shorts</option>
      </select>
      <br />

      <label>Changes Made</label>
      <br />
      <textarea
        name="changesMade"
        placeholder="What changed in the song?"
        value={formData.changesMade}
        onChange={handleChange}
      />
      <br />

      <label>Extra Vibe Note</label>
      <br />
      <textarea
        name="extraVibeNote"
        placeholder="Extra vibe note"
        value={formData.extraVibeNote}
        onChange={handleChange}
      />
      <br />

      <button onClick={onGenerate}>Generate</button>
    </div>
  );
}

export default InputForm;