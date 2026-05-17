import FormField from '../ui/FormField';

export default function TagPhraseEditor({
  title,
  tagName,
  field,
  phrases = [],
  onUpdateTag,
}) {
  const updatePhrase = (index, value) => {
    const nextPhrases = phrases.map((phrase, i) =>
      i === index ? value : phrase,
    );

    onUpdateTag(tagName, {
      [field]: nextPhrases,
    });
  };

  const addPhrase = () => {
    onUpdateTag(tagName, {
      [field]: [...phrases, ''],
    });
  };

  const removePhrase = (index) => {
    onUpdateTag(tagName, {
      [field]: phrases.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="tag-phrase-editor">
      <FormField label={title}>
        {phrases.map((phrase, index) => (
          <div className="tag-phrase-row" key={index}>
            <input
              key={`${tagName}-${field}-${index}-${phrase}`}
              className="form-input"
              defaultValue={phrase}
              onBlur={(e) => updatePhrase(index, e.target.value)}
            />

            <button
              type="button"
              className="button-secondary"
              onClick={() => removePhrase(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="button-secondary" onClick={addPhrase}>
          Add phrase
        </button>
      </FormField>
    </div>
  );
}
