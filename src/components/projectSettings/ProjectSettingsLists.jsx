import { useState } from 'react';
import StructuredListEditor from './lists/StructuredListEditor';

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

function prettifyKey(key) {
  return key
    .replace(/Block$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function generateBlockKey(name, existingKeys) {
  const words = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const base = words
    .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join('') || 'list';

  let key = `${base}Block`;
  let suffix = 2;

  while (existingKeys.includes(key) || key === 'supportBlock') {
    key = `${base}Block${suffix}`;
    suffix += 1;
  }

  return key;
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

  const [resetKeys, setResetKeys] = useState({});
  const [supportResetKey, setSupportResetKey] = useState(0);

  function bumpResetKey(blockKey) {
    setResetKeys((prev) => ({ ...prev, [blockKey]: (prev[blockKey] || 0) + 1 }));
  }

  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockType, setNewBlockType] = useState('text');
  const [newBlockScope, setNewBlockScope] = useState('project');
  const [newBlockTarget, setNewBlockTarget] = useState('long');

  function handleAddBlock() {
    const name = newBlockName.trim();
    if (!name) return;

    const key = generateBlockKey(name, customBlockKeys);

    saveCustomBlock(key, {
      name,
      title: '',
      items: [],
      scope: newBlockScope,
      target: newBlockTarget,
      itemType: newBlockType,
      isCore: false,
    });

    setNewBlockName('');
    setNewBlockType('text');
    setNewBlockScope('project');
    setNewBlockTarget('long');
  }

  const noBlocks = customBlockKeys.length === 0 && !supportBlockData;

  return (
    <>
      <h2 className="panel-title">Lists</h2>

      {noBlocks && (
        <p className="tag-summary">No list blocks configured for this project.</p>
      )}

      {customBlockKeys.map((blockKey) => {
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

      {supportBlockData && (
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

      <div className="tag-editor-section list-block-add-row">
        <input
          className="form-input"
          placeholder="New list name (e.g. Sponsor Shoutouts)"
          value={newBlockName}
          onChange={(e) => setNewBlockName(e.target.value)}
        />
        <select
          className="links-editor-badge-select"
          value={newBlockType}
          onChange={(e) => setNewBlockType(e.target.value)}
        >
          <option value="text">Text</option>
          <option value="link">Link</option>
        </select>
        <select
          className="links-editor-badge-select"
          value={newBlockScope}
          onChange={(e) => setNewBlockScope(e.target.value)}
        >
          <option value="project">Project</option>
          <option value="song">Song</option>
        </select>
        <select
          className="links-editor-badge-select"
          value={newBlockTarget}
          onChange={(e) => setNewBlockTarget(e.target.value)}
        >
          <option value="long">Long</option>
          <option value="shorts">Shorts</option>
          <option value="both">Long + Shorts</option>
        </select>
        <button
          type="button"
          className="tag-reset-button"
          onClick={handleAddBlock}
          disabled={!newBlockName.trim()}
        >
          +
        </button>
      </div>
    </>
  );
}
