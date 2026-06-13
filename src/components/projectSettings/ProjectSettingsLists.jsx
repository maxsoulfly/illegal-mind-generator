import StructuredListEditor from './lists/StructuredListEditor';

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
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
}) {
  const longTemplates = projectConfig.description?.templates?.long || {};
  const customBlocks = longTemplates.customBlocks || {};

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

  const gearBlockData = customBlocks.gearBlock;
  const playlistBlockData = customBlocks.playlistBlock;
  const supportBlockData = longTemplates.supportBlock;

  const hasGearOverride = !!overriddenCustomBlocks.gearBlock;
  const hasPlaylistOverride = !!overriddenCustomBlocks.playlistBlock;
  const hasSupportOverride = !!overriddenLong.supportBlock;

  const noBlocks = !gearBlockData && !supportBlockData && !playlistBlockData;

  return (
    <>
      <h2 className="panel-title">Lists</h2>

      {noBlocks && (
        <p className="tag-summary">No list blocks configured for this project.</p>
      )}

      {gearBlockData && (
        <StructuredListEditor
          key={`gear-${hasGearOverride}`}
          label="Gear Used"
          blockData={gearBlockData}
          defaultScope="song"
          defaultTarget="long"
          hasOverride={hasGearOverride}
          onSave={(value) => saveCustomBlock('gearBlock', value)}
          onReset={() => resetCustomBlock('gearBlock')}
        />
      )}

      {supportBlockData && (
        <StructuredListEditor
          key={`support-${hasSupportOverride}`}
          label="Support Block"
          blockData={supportBlockData}
          defaultScope="project"
          defaultTarget="both"
          hasOverride={hasSupportOverride}
          onSave={(value) => saveLongBlock('supportBlock', value)}
          onReset={() => resetLongBlock('supportBlock')}
        />
      )}

      {playlistBlockData && (
        <StructuredListEditor
          key={`playlist-${hasPlaylistOverride}`}
          label="Playlists"
          blockData={playlistBlockData}
          defaultScope="project"
          defaultTarget="long"
          hasOverride={hasPlaylistOverride}
          onSave={(value) => saveCustomBlock('playlistBlock', value)}
          onReset={() => resetCustomBlock('playlistBlock')}
        />
      )}
    </>
  );
}
