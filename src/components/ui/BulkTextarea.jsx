import PlaceholderField from './PlaceholderField';
import IconButton from './IconButton';
import { cancelOnEscape } from '../../utils/keyboard';

export default function BulkTextarea({ value, onChange, onApply, onCancel, placeholders }) {
  return (
    <div className="tag-section" onKeyDown={cancelOnEscape(onCancel)}>
      <PlaceholderField
        multiline
        className="form-input"
        rows={4}
        placeholder="One phrase per line"
        defaultValue={value}
        onChange={onChange}
        placeholders={placeholders}
      />

      <div className="button-row">
        <IconButton icon="Apply" className="button-secondary" onClick={onApply} />
        <IconButton icon="Cancel" className="button-secondary" onClick={onCancel} />
      </div>
    </div>
  );
}
