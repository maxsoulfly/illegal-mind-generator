import { useState } from 'react';
import TextBlockEditor from './blocks/TextBlockEditor';
import AddTextBlockForm from './blocks/AddTextBlockForm';
import {
  KNOWN_CUSTOM_BLOCKS,
  isTextBlock,
  getBlockLabel,
  prettifyBlockKey,
  updateLongKey,
} from '../../utils/customBlocks';

export default function ProjectSettingsTextBlocks({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
}) {
  const longTemplates = projectConfig.description?.templates?.long || {};
  const customBlocks = longTemplates.customBlocks || {};
  const baseCustomBlocks =
    baseProjectConfig?.description?.templates?.long?.customBlocks || {};

  const overriddenCustomBlocks =
    projectSettingsOverrides?.description?.templates?.long?.customBlocks || {};

  function saveCustomBlock(blockKey, value) {
    updateProjectOverride(
      updateLongKey(projectSettingsOverrides, 'customBlocks', {
        ...overriddenCustomBlocks,
        [blockKey]: value,
      }),
    );
  }

  function resetCustomBlock(blockKey) {
    const { [blockKey]: _removed, ...remaining } = overriddenCustomBlocks;
    updateProjectOverride(
      updateLongKey(projectSettingsOverrides, 'customBlocks', remaining),
    );
  }

  const textBlockKeys = Object.keys(customBlocks).filter((key) =>
    isTextBlock(customBlocks[key]),
  );

  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const visibleBlockKeys = textBlockKeys.filter(
    (key) =>
      !needle || getBlockLabel(key, customBlocks[key]).toLowerCase().includes(needle),
  );

  const [resetKeys, setResetKeys] = useState({});

  function bumpResetKey(blockKey) {
    setResetKeys((prev) => ({ ...prev, [blockKey]: (prev[blockKey] || 0) + 1 }));
  }

  const noBlocks = textBlockKeys.length === 0;
  const noMatches = !noBlocks && visibleBlockKeys.length === 0;

  return (
    <>
      {textBlockKeys.length > 5 && (
        <input
          className="form-input links-registry-search"
          placeholder="Search text blocks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {noBlocks && (
        <p className="tag-summary">No text blocks configured for this project.</p>
      )}

      {noMatches && <p className="tag-summary">No text blocks match your search.</p>}

      {visibleBlockKeys.map((blockKey) => {
        const known = KNOWN_CUSTOM_BLOCKS[blockKey];
        const blockData = customBlocks[blockKey];
        const hasBaseDefault = blockKey in baseCustomBlocks;

        return (
          <TextBlockEditor
            key={`${blockKey}-${resetKeys[blockKey] || 0}`}
            label={known?.label || (typeof blockData === 'object' && blockData?.name) || prettifyBlockKey(blockKey)}
            blockData={blockData}
            defaultScope={known?.defaultScope || 'project'}
            defaultTarget={known?.defaultTarget || 'long'}
            hasOverride={hasBaseDefault && !!overriddenCustomBlocks[blockKey]}
            onSave={(value) => saveCustomBlock(blockKey, value)}
            onReset={
              hasBaseDefault
                ? () => {
                    resetCustomBlock(blockKey);
                    bumpResetKey(blockKey);
                  }
                : undefined
            }
            onDelete={
              hasBaseDefault ? undefined : () => resetCustomBlock(blockKey)
            }
          />
        );
      })}

      <AddTextBlockForm
        existingKeys={Object.keys(customBlocks)}
        onAdd={saveCustomBlock}
      />
    </>
  );
}
