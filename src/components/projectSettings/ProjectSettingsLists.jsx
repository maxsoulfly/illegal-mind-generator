import { useState } from 'react';
import StructuredListEditor from './lists/StructuredListEditor';
import AddListBlockForm from './lists/AddListBlockForm';
import {
  KNOWN_CUSTOM_BLOCKS,
  isListBlock,
  getBlockLabel,
  prettifyBlockKey,
  updateLongKey,
  removeLongKey,
} from '../../utils/customBlocks';

export default function ProjectSettingsLists({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
}) {
  const longTemplates = projectConfig.description?.templates?.long || {};
  const customBlocks = longTemplates.customBlocks || {};
  const baseCustomBlocks =
    baseProjectConfig?.description?.templates?.long?.customBlocks || {};
  const linkKeys = Object.keys(projectConfig.description?.links || {});

  const overriddenCustomBlocks =
    projectSettingsOverrides?.description?.templates?.long?.customBlocks || {};
  const overriddenLong =
    projectSettingsOverrides?.description?.templates?.long || {};

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

  function saveLongBlock(blockKey, value) {
    updateProjectOverride(updateLongKey(projectSettingsOverrides, blockKey, value));
  }

  function resetLongBlock(blockKey) {
    updateProjectOverride(removeLongKey(projectSettingsOverrides, blockKey));
  }

  const supportBlockData = longTemplates.supportBlock;
  const hasSupportOverride = !!overriddenLong.supportBlock;

  const customBlockKeys = Object.keys(customBlocks).filter((key) =>
    isListBlock(customBlocks[key]),
  );

  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const visibleBlockKeys = customBlockKeys.filter((key) =>
    !needle || getBlockLabel(key, customBlocks[key]).toLowerCase().includes(needle),
  );
  const supportMatchesSearch = !needle || 'support block'.includes(needle);

  const [resetKeys, setResetKeys] = useState({});
  const [supportResetKey, setSupportResetKey] = useState(0);

  function bumpResetKey(blockKey) {
    setResetKeys((prev) => ({ ...prev, [blockKey]: (prev[blockKey] || 0) + 1 }));
  }

  const noBlocks = customBlockKeys.length === 0 && !supportBlockData;
  const noMatches =
    !noBlocks && visibleBlockKeys.length === 0 && !(supportBlockData && supportMatchesSearch);

  return (
    <>
      {customBlockKeys.length + (supportBlockData ? 1 : 0) > 5 && (
        <input
          className="form-input links-registry-search"
          placeholder="Search lists…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {noBlocks && (
        <p className="tag-summary">No list blocks configured for this project.</p>
      )}

      {noMatches && <p className="tag-summary">No lists match your search.</p>}

      {visibleBlockKeys.map((blockKey) => {
        const known = KNOWN_CUSTOM_BLOCKS[blockKey];
        const blockData = customBlocks[blockKey];
        const hasBaseDefault = blockKey in baseCustomBlocks;

        return (
          <StructuredListEditor
            key={`${blockKey}-${resetKeys[blockKey] || 0}`}
            label={known?.label || blockData?.name || prettifyBlockKey(blockKey)}
            blockData={blockData}
            defaultScope={known?.defaultScope || 'project'}
            defaultTarget={known?.defaultTarget || 'long'}
            linkKeys={linkKeys}
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

      {supportBlockData && supportMatchesSearch && (
        <StructuredListEditor
          key={`support-${supportResetKey}`}
          label="Support Block"
          blockData={supportBlockData}
          defaultScope="project"
          defaultTarget="both"
          linkKeys={linkKeys}
          hasOverride={hasSupportOverride}
          onSave={(value) => saveLongBlock('supportBlock', value)}
          onReset={() => { resetLongBlock('supportBlock'); setSupportResetKey((k) => k + 1); }}
        />
      )}

      <AddListBlockForm
        existingKeys={Object.keys(customBlocks)}
        onAdd={saveCustomBlock}
      />
    </>
  );
}
