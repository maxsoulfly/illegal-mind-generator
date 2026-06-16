import { useState } from 'react';
import FormSelect from '../../ui/FormSelect';
import IconButton from '../../ui/IconButton';
import { generateBlockKey } from '../../../utils/customBlocks';

const SCOPE_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'song', label: 'Song' },
];

const TARGET_OPTIONS = [
  { value: 'long', label: 'Long' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'both', label: 'Long + Shorts' },
];

// Creation form for a new text block — generates a key from the name and
// hands off an empty, unlocked block to onAdd.
export default function AddTextBlockForm({ existingKeys, onAdd }) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState('project');
  const [target, setTarget] = useState('long');

  function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const key = generateBlockKey(trimmedName, existingKeys);

    onAdd(key, {
      name: trimmedName,
      text: '',
      scope,
      target,
      isCore: false,
    });

    setName('');
    setScope('project');
    setTarget('long');
  }

  return (
    <div className="tag-editor-section list-block-add-row">
      <input
        className="form-input"
        placeholder="New text block name (e.g. Mixing CTA)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FormSelect value={scope} onChange={setScope} options={SCOPE_OPTIONS} />
      <FormSelect value={target} onChange={setTarget} options={TARGET_OPTIONS} />
      <IconButton icon="+" onClick={handleAdd} disabled={!name.trim()} />
    </div>
  );
}
