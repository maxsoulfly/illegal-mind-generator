import { useState } from 'react';
import FormSelect from '../../ui/FormSelect';
import IconButton from '../../ui/IconButton';
import { generateBlockKey, SCOPE_OPTIONS, TARGET_OPTIONS } from '../../../utils/customBlocks';

export default function AddBlockForm({ placeholder, existingKeys, onAdd }) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState('project');
  const [target, setTarget] = useState('long');

  function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const key = generateBlockKey(trimmedName, existingKeys);
    onAdd(key, trimmedName, scope, target);
    setName('');
    setScope('project');
    setTarget('long');
  }

  return (
    <div className="tag-editor-section list-block-add-row">
      <input
        className="form-input"
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FormSelect value={scope} onChange={setScope} options={SCOPE_OPTIONS} />
      <FormSelect value={target} onChange={setTarget} options={TARGET_OPTIONS} />
      <IconButton icon="+" onClick={handleAdd} disabled={!name.trim()} />
    </div>
  );
}
