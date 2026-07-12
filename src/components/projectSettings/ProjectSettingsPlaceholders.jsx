import { useState } from 'react';
import BlockEditorCard from './blocks/BlockEditorCard';
import FormField from '../ui/FormField';
import FormSelect from '../ui/FormSelect';
import IconButton from '../ui/IconButton';

// Fixed set of tag-scoped array fields a placeholder can pool from — same
// fields the Tag Editor's Descriptions/Short Hooks tabs already expose for
// direct editing (see TAG_FIELD_TABS in src/utils/tagFieldTabs.js), just
// offered here as a source instead. Combined into one
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

function sourceToFieldValue(source = {}) {
  if (!source.tagField) return '';
  return source.tagParentField ? `${source.tagParentField}.${source.tagField}` : source.tagField;
}

function fieldValueToSource(value, existingSource = {}) {
  const { hookBlockKey } = existingSource;
  if (!value) return { ...(hookBlockKey ? { hookBlockKey } : {}) };
  const [tagParentField, tagField] = value.split('.');
  return { tagParentField, tagField, ...(hookBlockKey ? { hookBlockKey } : {}) };
}

// Placeholder keys are a separate namespace from hookBlocks/customBlocks/
// blockGroups (addressed as {custom.<key>} tokens, never bare layout/editor
// keys — see placeholders.js) — no "Block" suffix, no cross-namespace
// collision check needed, so this doesn't reuse generateBlockKey.
function generatePlaceholderKey(name, existingKeys) {
  const words = name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const base = words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('') || 'placeholder';
  let key = base;
  let suffix = 2;
  while (existingKeys.includes(key)) {
    key = `${base}${suffix}`;
    suffix += 1;
  }
  return key;
}

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

export default function ProjectSettingsPlaceholders({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  openBlockKey,
}) {
  const overriddenDesc = projectSettingsOverrides.description || {};
  const placeholders = projectConfig.description?.placeholders || [];
  const hookBlocks = projectConfig.description?.hookBlocks || [];

  const dynamicKeys = new Set((overriddenDesc.customPlaceholders || []).map((p) => p.key));
  const isDynamic = (key) => dynamicKeys.has(key);

  const hookBlockOptions = [
    { value: '', label: 'None' },
    ...hookBlocks.map((b) => ({ value: b.key, label: b.label })),
  ];

  function patchPlaceholder(placeholder, patch) {
    if (isDynamic(placeholder.key)) {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          customPlaceholders: (overriddenDesc.customPlaceholders || []).map((p) =>
            p.key === placeholder.key ? { ...p, ...patch } : p,
          ),
        },
      });
    } else {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          placeholderOverrides: {
            ...(overriddenDesc.placeholderOverrides || {}),
            [placeholder.key]: { ...(overriddenDesc.placeholderOverrides?.[placeholder.key] || {}), ...patch },
          },
        },
      });
    }
  }

  function resetPlaceholder(key) {
    const { [key]: _removed, ...remaining } = overriddenDesc.placeholderOverrides || {};
    updateProjectOverride({ description: { ...overriddenDesc, placeholderOverrides: remaining } });
  }

  function deletePlaceholder(placeholder) {
    if (placeholder.isCore) return;
    if (!window.confirm(`Delete this placeholder? Any template still referencing {custom.${placeholder.key}} will resolve it as empty. This cannot be undone.`)) return;
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customPlaceholders: (overriddenDesc.customPlaceholders || []).filter((p) => p.key !== placeholder.key),
      },
    });
  }

  function addPlaceholder(key, name) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customPlaceholders: [
          ...(overriddenDesc.customPlaceholders || []),
          { key, label: name, source: {}, count: 1, isCore: false },
        ],
      },
    });
  }

  const existingKeys = placeholders.map((p) => p.key);

  return (
    <>
      {placeholders.map((placeholder) => {
        const dynamic = isDynamic(placeholder.key);
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
