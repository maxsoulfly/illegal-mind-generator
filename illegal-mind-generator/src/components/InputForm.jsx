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

      <input
        name="artist"
        placeholder="Artist"
        value={formData.artist}
        onChange={handleChange}
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Handles form submission by logging the current form data to the console.
 * @return {void}
 */
/*******  b1f1ab2e-875f-4305-b3f9-9af39a6ca7e8  *******/      />
      <br />

      <input
        name="song"
        placeholder="Song"
        value={formData.song}
        onChange={handleChange}
      />
      <br />

      <input
        name="signalNumber"
        placeholder="Signal Number"
        value={formData.signalNumber}
        onChange={handleChange}
      />
      <br />

      <button onClick={onGenerate}>Generate</button>
    </div>
  );
}

export default InputForm;