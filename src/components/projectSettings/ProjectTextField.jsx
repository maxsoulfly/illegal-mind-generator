export default function ProjectTextField({
  label,
  value,
  fieldName,
  isOverridden,
  onChange,
  onReset,
  multiline = false,
  placeholder = '',
}) {
  const Field = multiline ? 'textarea' : 'input';

  return (
    <div className="form-group">
      <div className="form-label">{label}</div>

      <div className="tag-phrase-row">
        <Field
          className={multiline ? 'form-textarea' : 'form-input'}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange({
              [fieldName]: e.target.value,
            })
          }
        />

        <button
          type="button"
          className="button-secondary"
          onClick={() => onReset(fieldName)}
          disabled={!isOverridden}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
