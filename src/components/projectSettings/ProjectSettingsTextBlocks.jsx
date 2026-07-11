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
  openBlockKey,
}) {
  const longTemplates = projectConfig.description?.templates?.long || {};
  const customBlocks = longTemplates.customBlocks || {};
  const hookBlocks = projectConfig.description?.hookBlocks || [];
  // A new block's key must avoid every existing block's storage key AND every
  // hook block's layout key (descriptionLayoutKey) — a List/Text block whose
  // key happens to match a hook block's layout key gets silently orphaned
  // from the Descriptions layout builder (resolveBlockSource/label resolvers
  // check the hook-layout-key namespace first). See descriptionLayout.js.
  const existingBlockKeys = [
    ...Object.keys(customBlocks),
    ...hookBlocks.map((b) => b.key),
    ...hookBlocks.map((b) => b.descriptionLayoutKey ?? b.key),
  ];
  const baseCustomBlocks =
    baseProjectConfig?.description?.templates?.long?.customBlocks || {};
  const linkKeys = Object.keys(projectConfig.description?.links || {});

  const overriddenDesc = projectSettingsOverrides?.description || {};
  const overriddenLong =
    projectSettingsOverrides?.description?.templates?.long || {};
  const overriddenCustomBlocks =
    projectSettingsOverrides?.description?.templates?.long?.customBlocks || {};
  const blockLabelOverrides = overriddenDesc.blockLabelOverrides || {};

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
    const { [blockKey]: _label, ...remainingLabels } = blockLabelOverrides;
    const templates_ = projectSettingsOverrides.description?.templates || {};
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        blockLabelOverrides: remainingLabels,
        templates: {
          ...templates_,
          long: { ...overriddenLong, customBlocks: remaining },
        },
      },
    });
  }

  function renameBlock(blockKey, newLabel, blockData, hasBaseDefault) {
    if (hasBaseDefault) {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          blockLabelOverrides: { ...blockLabelOverrides, [blockKey]: newLabel },
        },
      });
    } else {
      saveCustomBlock(blockKey, { ...blockData, name: newLabel });
    }
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
          type="search"
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
        const label =
          blockLabelOverrides[blockKey] ||
          known?.label ||
          (typeof blockData === 'object' && blockData?.name) ||
          prettifyBlockKey(blockKey);

        return (
          <TextBlockEditor
            key={`${blockKey}-${resetKeys[blockKey] || 0}`}
            label={label}
            blockData={blockData}
            defaultScope={known?.defaultScope || 'project'}
            defaultTarget={known?.defaultTarget || 'long'}
            linkKeys={linkKeys}
            hasOverride={
              hasBaseDefault &&
              (!!overriddenCustomBlocks[blockKey] || !!blockLabelOverrides[blockKey])
            }
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
            onRename={(newLabel) => renameBlock(blockKey, newLabel, blockData, hasBaseDefault)}
            open={openBlockKey === blockKey}
          />
        );
      })}

      <AddTextBlockForm
        existingKeys={existingBlockKeys}
        onAdd={saveCustomBlock}
      />
    </>
  );
}
