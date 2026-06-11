import FormField from './FormField';

export default function ProjectTextField({
  label,
  value,
  fieldName,
  onChange,
  onReset,
}) {
  return (
    <FormField label={label}>
      <div className="tag-phrase-row">
        <input
          className="form-input"
          value={value}
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
        >
          Reset
        </button>
      </div>
    </FormField>
  );
}
