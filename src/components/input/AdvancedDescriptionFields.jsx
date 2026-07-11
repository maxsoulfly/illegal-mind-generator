import { useEffect, useState } from 'react';

import FormField from '../ui/FormField';
import IconButton from '../ui/IconButton';
import PlaceholderField from '../ui/PlaceholderField';
import { isTextBlock, isListBlock, getBlockLabel, detectItemType } from '../../utils/customBlocks';
import { buildHookPlaceholders } from '../../utils/hookPlaceholders';


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

// Song-scoped blocks get a per-song override field here.
// Text blocks: a textarea override (plain string).
// List blocks: a mini list editor initialized from project defaults.
// Extend this loop (not a new mechanism) when Block Group gains song scope.
//
// songOverrideTarget/clearSongOverrideTarget (from useAppShellState's
// openSongOverride) drive click-to-scroll from DescriptionsPanel: clicking a
// song-overridden description block expands Advanced Options (already handled
// by openSongOverride) and jumps here to the specific field that produced it.
function SongBlockOverrideFields({ formData, setFormData, projectConfig, songOverrideTarget, clearSongOverrideTarget }) {
  const customBlocks = projectConfig?.description?.templates?.long?.customBlocks || {};
  const linkKeys = Object.keys(projectConfig?.description?.links || {});

  const songBlocks = Object.entries(customBlocks).filter(
    ([, block]) =>
      block &&
      typeof block === 'object' &&
      block.scope === 'song' &&
      (isTextBlock(block) || isListBlock(block)),
  );

  // defaultScope (projects.json, per hook block) replaces any hardcoded
  // key-name check — storyBlock/logBlock declare "defaultScope": "song" there
  // since that's their historical default; everything else implicitly
  // defaults to 'project'. Must match ProjectSettingsHookBlocks.jsx's getScope.
  const phraseBlockScopes = projectConfig?.description?.templates?.long?.phraseBlockScopes || {};
  const songScopeHookBlocks = (projectConfig?.description?.hookBlocks || [])
    .filter((b) => (phraseBlockScopes[b.key] ?? b.defaultScope ?? 'project') === 'song');

  const textPlaceholders = [...buildHookPlaceholders(projectConfig), ...linkKeys.map((key) => `{links.${key}}`)];

  // Auto-open + scroll to the targeted field. Runs after the fields below have
  // rendered their `id`s, so a plain DOM lookup is simpler than juggling a ref
  // per loop iteration across three separate .map() calls.
  useEffect(() => {
    if (!songOverrideTarget?.blockKey) return;
    const el = document.getElementById(`song-override-${songOverrideTarget.blockKey}`);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [songOverrideTarget]);

  function isTargeted(key) {
    return songOverrideTarget?.blockKey === key;
  }

  function fieldClassName(key) {
    return isTargeted(key) ? 'tag-section tag-section--highlight' : 'tag-section';
  }

  // Highlight is "consumed" once the user actually edits or resets the field
  // they were sent to — it's served its purpose (helping them find it).
  function updateOverride(key, value) {
    setFormData((prev) => ({
      ...prev,
      songBlockOverrides: {
        ...(prev.songBlockOverrides || {}),
        [key]: value,
      },
    }));
    if (isTargeted(key)) clearSongOverrideTarget?.();
  }

  function clearOverride(key) {
    setFormData((prev) => {
      const { [key]: _removed, ...rest } = prev.songBlockOverrides || {};
      return { ...prev, songBlockOverrides: rest };
    });
    if (isTargeted(key)) clearSongOverrideTarget?.();
  }

  return (
    <>
      {songBlocks.map(([key, block]) => {
        const label = getBlockLabel(key, block);

        if (isListBlock(block)) {
          const hasOverride = key in (formData.songBlockOverrides || {});
          const overrideItems = hasOverride
            ? (formData.songBlockOverrides[key]?.items ?? [])
            : (block.items ?? []);

          return (
            <details key={key} id={`song-override-${key}`} className={fieldClassName(key)}>
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
                placeholders={textPlaceholders}
              />
            </details>
          );
        }

        return (
          <details key={key} id={`song-override-${key}`} className={fieldClassName(key)}>
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

      {songScopeHookBlocks.map((block) => {
        const overrideKey = block.descriptionLayoutKey ?? block.key;
        const overrideType = projectConfig?.description?.hookBlockOverrideTypes?.[block.key] ?? 'textarea';
        const hasOverride = overrideKey in (formData.songBlockOverrides || {});
        const storedValue = typeof formData.songBlockOverrides?.[overrideKey] === 'string'
          ? formData.songBlockOverrides[overrideKey]
          : '';
        return (
          <details key={block.key} id={`song-override-${overrideKey}`} className={fieldClassName(overrideKey)}>
            <summary>
              {block.label}
              {hasOverride && (
                <IconButton
                  icon="↺"
                  title="Reset to project default"
                  stopPropagation
                  onClick={() => clearOverride(overrideKey)}
                />
              )}
            </summary>
            <PlaceholderField
              multiline={overrideType !== 'one-line'}
              rows={3}
              defaultValue={storedValue}
              onChange={(value) => updateOverride(overrideKey, value)}
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
  songOverrideTarget,
  clearSongOverrideTarget,
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
        songOverrideTarget={songOverrideTarget}
        clearSongOverrideTarget={clearSongOverrideTarget}
      />
    </div>
  );
}
