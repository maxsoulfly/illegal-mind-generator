import FormField from '../ui/FormField';

export default function TagPhraseEditor({
  title,
  tagName,
  field,
  parentField,
  parentValue = {},

  phrases = [],
  onUpdateTag,
}) {
  const buildUpdate = (nextPhrases) => {
    if (!parentField) {
      return {
        [field]: nextPhrases,
      };
    }

    return {
      [parentField]: {
        ...parentValue,
        [field]: nextPhrases,
      },
    };
  };

  const updatePhrase = (index, value) => {
    const nextPhrases = phrases.map((phrase, i) =>
      i === index ? value : phrase,
    );

    onUpdateTag(tagName, buildUpdate(nextPhrases));
  };

  const addPhrase = () => {
    onUpdateTag(tagName, buildUpdate([...phrases, '']));
  };

  const bulkAddPhrases = () => {
    const pastedText = window.prompt('Paste phrases, one per line');

    if (!pastedText) return;

    const newPhrases = pastedText
      .split('\n')
      .map((phrase) => phrase.trim())
      .filter(Boolean);

    if (newPhrases.length === 0) return;

    onUpdateTag(tagName, buildUpdate([...phrases, ...newPhrases]));
  };

  const removePhrase = (index) => {
    onUpdateTag(tagName, buildUpdate(phrases.filter((_, i) => i !== index)));
  };

  return (
    <details className="tag-editor-section" open={false}>
      <summary>
        {title} ({phrases.length})
      </summary>

      <div className="tag-phrase-editor">
        <FormField>
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
                ✕
              </button>
            </div>
          ))}
          <div className="button-row">
            <button
              type="button"
              className="button-secondary"
              onClick={addPhrase}
            >
              + Add
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={bulkAddPhrases}
            >
              + Bulk
            </button>
          </div>
        </FormField>
      </div>
    </details>
  );
}
