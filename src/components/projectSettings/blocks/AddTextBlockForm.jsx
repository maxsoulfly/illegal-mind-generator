import AddBlockForm from './AddBlockForm';

export default function AddTextBlockForm({ existingKeys, onAdd }) {
  return (
    <AddBlockForm
      placeholder="New text block name (e.g. Mixing CTA)"
      existingKeys={existingKeys}
      onAdd={(key, name, scope, target) =>
        onAdd(key, { name, text: '', scope, target, isCore: false })
      }
    />
  );
}
