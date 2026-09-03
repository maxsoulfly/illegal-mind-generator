import { useState } from 'react';
import BlockEditorCard from './BlockEditorCard';
import PlaceholderReference from './PlaceholderReference';
import FormField from '../../ui/FormField';
import FormSelect from '../../ui/FormSelect';
import IconButton from '../../ui/IconButton';
import ToggleField from '../../ui/ToggleField';
import {
  isDynamicPlaceholder,
  sourceToFieldValue,
  fieldValueToSource,
  generatePlaceholderKey,
  patchPlaceholderPatch,
  resetPlaceholderPatch,
  deletePlaceholderPatch,
  addPlaceholderPatch,
} from '../../../utils/placeholderOverrides';

// Fixed set of tag-scoped array fields a placeholder can pool from — the
// same description/shortHooks sub-fields the Tag Editor exposes for direct
// editing, just offered here as a source instead. Combined into one
// dropdown (rather than two cascading tagParentField/tagField selects) since
// the parent/field split is a config-shape detail, not something a user
// needs to reason about in two steps.
const TAG_FIELD_OPTIONS = [
  { value: '', label: 'None (project pool only)' },
  { value: 'description.technical', label: 'Description · Technical' },
  { value: 'description.log', label: 'Description · Log' },
  { value: 'description.status', label: 'Description · Status' },
  { value: 'shortHooks.nostalgia', label: 'Short Hooks · Nostalgia' },
  { value: 'shortHooks.emotion', label: 'Short Hooks · Emotion' },
  { value: 'shortHooks.transformation', label: 'Short Hooks · Transformation' },
  { value: 'shortHooks.discussion', label: 'Short Hooks · Discussion' },
  { value: 'shortHooks.musician', label: 'Short Hooks · Musician' },
  { value: 'shortHooks.progress', label: 'Short Hooks · Progress' },
];

function AddPlaceholderRow({ existingKeys, onAdd }) {
  const [name, setName] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(generatePlaceholderKey(trimmed, existingKeys), trimmed);
    setName('');
  }

  return (
    <div className="tag-editor-section list-block-add-row">
      <input
        className="form-input"
        placeholder="New placeholder name (e.g. Tag Log Line)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <IconButton icon="+" onClick={handleAdd} disabled={!name.trim()} />
    </div>
  );
}

export default function Placeholders({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  openBlockKey,
}) {
  const overriddenDesc = projectSettingsOverrides.description || {};
  const placeholders = projectConfig.description?.placeholders || [];
  const hookBlocks = projectConfig.description?.hookBlocks || [];

  const hookBlockOptions = [
    { value: '', label: 'None' },
    ...hookBlocks.map((b) => ({ value: b.key, label: b.label })),
  ];

  function patchPlaceholder(placeholder, patch) {
    const dynamic = isDynamicPlaceholder(overriddenDesc, placeholder.key);
    updateProjectOverride(patchPlaceholderPatch(overriddenDesc, placeholder, patch, dynamic));
  }

  function resetPlaceholder(key) {
    updateProjectOverride(resetPlaceholderPatch(overriddenDesc, key));
  }

  function deletePlaceholder(placeholder) {
    if (placeholder.isCore) return;
    if (!window.confirm(`Delete this placeholder? Any template still referencing {custom.${placeholder.key}} will resolve it as empty. This cannot be undone.`)) return;
    updateProjectOverride(deletePlaceholderPatch(overriddenDesc, placeholder));
  }

  function addPlaceholder(key, name) {
    updateProjectOverride(addPlaceholderPatch(overriddenDesc, key, name));
  }

  const existingKeys = placeholders.map((p) => p.key);

  return (
    <>
      <PlaceholderReference projectConfig={projectConfig} />
      {placeholders.map((placeholder) => {
        const dynamic = isDynamicPlaceholder(overriddenDesc, placeholder.key);
        return (
          <BlockEditorCard
            key={placeholder.key}
            label={placeholder.label}
            badge={`{custom.${placeholder.key}}`}
            hasOverride={!dynamic && !!overriddenDesc.placeholderOverrides?.[placeholder.key]}
            onReset={!dynamic ? () => resetPlaceholder(placeholder.key) : undefined}
            onDelete={dynamic ? () => deletePlaceholder(placeholder) : undefined}
            isCore={dynamic ? placeholder.isCore : undefined}
            onToggleCore={dynamic ? () => patchPlaceholder(placeholder, { isCore: !placeholder.isCore }) : undefined}
            onRename={(newLabel) => patchPlaceholder(placeholder, { label: newLabel })}
            open={openBlockKey === placeholder.key}
          >
            <FormField label="Tag field source">
              <FormSelect
                value={sourceToFieldValue(placeholder.source)}
                onChange={(val) =>
                  patchPlaceholder(placeholder, { source: fieldValueToSource(val, placeholder.source) })
                }
                options={TAG_FIELD_OPTIONS}
              />
            </FormField>
            <FormField label="Hook Block pool">
              <FormSelect
                value={placeholder.source?.hookBlockKey || ''}
                onChange={(val) =>
                  patchPlaceholder(placeholder, {
                    source: { ...placeholder.source, hookBlockKey: val || undefined },
                  })
                }
                options={hookBlockOptions}
              />
            </FormField>
            <FormField label="Short Hooks pool">
              <ToggleField
                label="Include every eligible Short Hooks phrase (base + selected tags)"
                checked={!!placeholder.source?.shortHookPool}
                onChange={(checked) =>
                  patchPlaceholder(placeholder, {
                    source: { ...placeholder.source, shortHookPool: checked || undefined },
                  })
                }
              />
            </FormField>
            <FormField label="Count">
              <input
                className="form-input form-input--compact"
                type="number"
                min="1"
                value={placeholder.count ?? 1}
                onChange={(e) =>
                  patchPlaceholder(placeholder, { count: Math.max(1, Number(e.target.value) || 1) })
                }
              />
            </FormField>
          </BlockEditorCard>
        );
      })}
      <AddPlaceholderRow existingKeys={existingKeys} onAdd={addPlaceholder} />
    </>
  );
}
