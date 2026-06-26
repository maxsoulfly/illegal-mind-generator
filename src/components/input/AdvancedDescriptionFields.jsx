import { useState } from 'react';

import FormField from '../ui/FormField';
import IconButton from '../ui/IconButton';
import PlaceholderField from '../ui/PlaceholderField';
import { isTextBlock, isListBlock, getBlockLabel } from '../../utils/customBlocks';

function detectItemType(block) {
  if (block?.itemType === 'text' || block?.itemType === 'link') return block.itemType;
  // Fallback for blocks created before itemType was an explicit field:
  // infer from item shape rather than failing or defaulting to 'text'.
  return (block?.items ?? []).some((item) => 'link' in item) ? 'link' : 'text';
}

function SongListBlockEditor({ items: initialItems, itemType, onChange }) {
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
          <input
            className="form-input"
            defaultValue={item[valueField] ?? ''}
            onBlur={(e) => handleBlur(i, valueField, e.target.value)}
            placeholder={itemType === 'link' ? 'URL' : 'Text'}
          />
          <IconButton icon="×" title="Remove item" onClick={() => handleRemove(i)} />
        </div>
      ))}
      <IconButton icon="+ Add" className="button-secondary" onClick={handleAdd} />
    </div>
  );
}

// Built-in engine blocks that support per-song text overrides.
// These are phrase-template blocks (not in customBlocks) so they're listed
// explicitly here. The engine reads from songBlockOverrides for these keys
// and falls back to the project-level template.
const PHRASE_BLOCK_OVERRIDES = [
  {
    key: 'storyBlock',
    label: 'Story',
    rows: 5,
    placeholder: 'Write a custom story paragraph... Supports {artist}, {song}, {tagLine}.',
    placeholders: ['{artist}', '{song}', '{tagLine}'],
  },
  {
    key: 'logBlock',
    label: 'Log Note',
    rows: 3,
    placeholder: 'Write a custom operator/log note...',
    placeholders: [],
  },
];

// Song-scoped blocks get a per-song override field here.
// Text blocks: a textarea override (plain string).
// List blocks: a mini list editor initialized from project defaults.
// Extend this loop (not a new mechanism) when Block Group gains song scope.
function SongBlockOverrideFields({ formData, setFormData, projectConfig }) {
  const customBlocks = projectConfig?.description?.templates?.long?.customBlocks || {};
  const linkKeys = Object.keys(projectConfig?.description?.links || {});

  const songBlocks = Object.entries(customBlocks).filter(
    ([, block]) =>
      block &&
      typeof block === 'object' &&
      block.scope === 'song' &&
      (isTextBlock(block) || isListBlock(block)),
  );

  const textPlaceholders = ['{artist}', '{song}', '{tagLine}', ...linkKeys.map((key) => `{links.${key}}`)];

  function updateOverride(key, value) {
    setFormData((prev) => ({
      ...prev,
      songBlockOverrides: {
        ...(prev.songBlockOverrides || {}),
        [key]: value,
      },
    }));
  }

  function clearOverride(key) {
    setFormData((prev) => {
      const { [key]: _removed, ...rest } = prev.songBlockOverrides || {};
      return { ...prev, songBlockOverrides: rest };
    });
  }

  return (
    <>
      {PHRASE_BLOCK_OVERRIDES.filter(({ key }) => {
        // Default 'song' (not 'project') — storyBlock/logBlock were always
        // song-scoped before phraseBlockScopes existed, so absent = show.
        const scope = projectConfig?.description?.templates?.long?.phraseBlockScopes?.[key] ?? 'song';
        return scope === 'song';
      }).map(({ key, label, rows, placeholder, placeholders }) => (
        <details key={key} className="tag-section">
          <summary>{label}</summary>
          <PlaceholderField
            multiline
            rows={rows}
            defaultValue={formData.songBlockOverrides?.[key] || ''}
            onChange={(value) => updateOverride(key, value)}
            placeholders={placeholders}
            placeholder={placeholder}
          />
        </details>
      ))}

      {songBlocks.map(([key, block]) => {
        const label = getBlockLabel(key, block);

        if (isListBlock(block)) {
          const hasOverride = key in (formData.songBlockOverrides || {});
          const overrideItems = hasOverride
            ? (formData.songBlockOverrides[key]?.items ?? [])
            : (block.items ?? []);

          return (
            <details key={key} className="tag-section">
              <summary>
                {label}
                {hasOverride && (
                  <IconButton
                    icon="↺"
                    title="Reset to project default"
                    stopPropagation
                    onClick={() => clearOverride(key)}
                  />
                )}
              </summary>
              {/* Key swap forces remount when override is toggled so
                  uncontrolled defaultValue inputs reset to the new items. */}
              <SongListBlockEditor
                key={hasOverride ? `${key}-override` : `${key}-default`}
                items={overrideItems}
                itemType={detectItemType(block)}
                onChange={(items) => updateOverride(key, { items })}
              />
            </details>
          );
        }

        return (
          <details key={key} className="tag-section">
            <summary>{label}</summary>
            <PlaceholderField
              multiline
              rows={3}
              defaultValue={formData.songBlockOverrides?.[key] || ''}
              onChange={(value) => updateOverride(key, value)}
              placeholders={textPlaceholders}
              placeholder="Override for this song only. Leave blank to use the project default."
            />
          </details>
        );
      })}
    </>
  );
}

export default function AdvancedDescriptionFields({
  formData,
  setFormData,
  projectConfig,
}) {
  return (
    <div className="form-group">
      <FormField label="Additional Hashtags">
        <input
          type="text"
          className="form-input"
          value={formData.customHashtags || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              customHashtags: e.target.value,
            }))
          }
          placeholder="tag1, tag2, tag3"
        />
      </FormField>

      <SongBlockOverrideFields
        formData={formData}
        setFormData={setFormData}
        projectConfig={projectConfig}
      />
    </div>
  );
}
