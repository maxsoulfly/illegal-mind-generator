import { useState } from 'react';

import IconButton from '../ui/IconButton';
import PlaceholderField from '../ui/PlaceholderField';

function SongListBlockEditor({ items: initialItems, itemType, onChange, placeholders = [] }) {
  const [items, setItems] = useState(() => initialItems);
  const valueField = itemType === 'link' ? 'link' : 'text';

  function commit(next) {
    setItems(next);
    onChange(next);
  }

  function handleBlur(index, field, value) {
    commit(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleAdd() {
    const newItem = itemType === 'link' ? { label: '', link: '' } : { label: '', text: '' };
    commit([...items, newItem]);
  }

  function handleRemove(index) {
    commit(items.filter((_, i) => i !== index));
  }

  return (
    <div className="form-group">
      {items.map((item, i) => (
        <div key={i} className="song-list-editor-row">
          <input
            className="form-input"
            defaultValue={item.label ?? ''}
            onBlur={(e) => handleBlur(i, 'label', e.target.value)}
            placeholder="Label"
          />
          <PlaceholderField
            defaultValue={item[valueField] ?? ''}
            onBlur={(value) => handleBlur(i, valueField, value)}
            placeholder={itemType === 'link' ? 'URL' : 'Text'}
            placeholders={placeholders}
          />
          <IconButton icon="×" title="Remove item" onClick={() => handleRemove(i)} />
        </div>
      ))}
      <IconButton icon="+ Add" className="button-secondary" onClick={handleAdd} />
    </div>
  );
}

export default SongListBlockEditor;
