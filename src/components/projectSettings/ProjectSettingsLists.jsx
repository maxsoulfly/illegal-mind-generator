import { useState } from 'react';
import StructuredListEditor from './lists/StructuredListEditor';
import AddListBlockForm from './lists/AddListBlockForm';

// Metadata for built-in customBlocks keys. Anything not listed here is a
// user-created block — its card label falls back to blockData.name or a
// prettified version of its key.
const KNOWN_CUSTOM_BLOCKS = {
  gearBlock: { label: 'Gear Used', defaultScope: 'song', defaultTarget: 'long' },
  playlistBlock: { label: 'Playlists', defaultScope: 'project', defaultTarget: 'long' },
  customCtaBlock: { label: 'Custom CTA', defaultScope: 'project', defaultTarget: 'long' },
};

// customBlocks mixes list-shaped blocks ({ title, items }) with plain-string
// Text blocks (e.g. mixingCtaBlock) — only list-shaped ones belong here.
function isListBlock(value) {
  return Boolean(value) && typeof value === 'object' && Array.isArray(value.items);
}

function getBlockLabel(key, blockData) {
  const known = KNOWN_CUSTOM_BLOCKS[key];
  return known?.label || blockData?.name || prettifyKey(key);
}

function prettifyKey(key) {
  return key
    .replace(/Block$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function updateLongKey(overrides, key, value) {
  return {
    description: {
      ...(overrides.description || {}),
      templates: {
        ...(overrides.description?.templates || {}),
        long: {
          ...(overrides.description?.templates?.long || {}),
          [key]: value,
        },
      },
    },
  };
}

function removeLongKey(overrides, key) {
  const { [key]: _removed, ...remaining } =
    overrides?.description?.templates?.long || {};
  return {
    description: {
      ...(overrides.description || {}),
      templates: {
        ...(overrides.description?.templates || {}),
        long: remaining,
      },
    },
  };
}

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
      <h2 className="panel-title">Lists</h2>

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
            label={known?.label || blockData?.name || prettifyKey(blockKey)}
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
        existingKeys={customBlockKeys}
        onAdd={saveCustomBlock}
      />
    </>
  );
}
