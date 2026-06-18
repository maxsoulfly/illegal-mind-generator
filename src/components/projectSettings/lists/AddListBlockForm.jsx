import { useState } from 'react';
import FormSelect from '../../ui/FormSelect';
import IconButton from '../../ui/IconButton';
import { generateBlockKey, SCOPE_OPTIONS, TARGET_OPTIONS } from '../../../utils/customBlocks';

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Link' },
];

// Creation form for a new list block — generates a key from the name and
// hands off an empty, unlocked block to onAdd.
export default function AddListBlockForm({ existingKeys, onAdd }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [scope, setScope] = useState('project');
  const [target, setTarget] = useState('long');

  function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const key = generateBlockKey(trimmedName, existingKeys);

    onAdd(key, {
      name: trimmedName,
      title: '',
      items: [],
      scope,
      target,
      itemType: type,
      isCore: false,
    });

    setName('');
    setType('text');
    setScope('project');
    setTarget('long');
  }

  return (
    <div className="tag-editor-section list-block-add-row">
      <input
        className="form-input"
        placeholder="New list name (e.g. Sponsor Shoutouts)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FormSelect value={type} onChange={setType} options={TYPE_OPTIONS} />
      <FormSelect value={scope} onChange={setScope} options={SCOPE_OPTIONS} />
      <FormSelect value={target} onChange={setTarget} options={TARGET_OPTIONS} />
      <IconButton icon="+" onClick={handleAdd} disabled={!name.trim()} />
    </div>
  );
}
