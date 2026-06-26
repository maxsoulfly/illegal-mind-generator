import { useState } from 'react';
import TagSyncControls from '../tags/TagSyncControls';
import ShortHookCard from '../ui/ShortHookCard';
import IconButton from '../ui/IconButton';
import PrimaryTagSection from './hooks/PrimaryTagSection';

function slugify(str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export default function ProjectSettingsShortHooks({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  baseHookTypes = {},
  otherProjects = [],
  syncHookTypesToProject,
  hookTarget,
}) {
  const [newLabel, setNewLabel] = useState('');
  const [copyTargetId, setCopyTargetId] = useState(() => otherProjects[0]?.id || '');
  const hookTypes = Object.entries(projectConfig.shortHookTypes || {});

  const primaryTagConfig = projectConfig.title?.primaryTag || {};

  function updatePrimaryTagConfig(key, value) {
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        primaryTag: {
          count: primaryTagConfig.count ?? 1,
          order: primaryTagConfig.order ?? 'selection',
          separator: primaryTagConfig.separator ?? ' & ',
          [key]: value,
        },
      },
    });
  }

  function resetPrimaryTagConfig() {
    const { primaryTag: _removed, ...remaining } = projectSettingsOverrides.title || {};
    updateProjectOverride({ title: remaining });
  }

  function updateHookTypeTemplates(hookType, hookConfig, newTemplates) {
    updateProjectOverride({
      shortHookTypes: {
        ...(projectSettingsOverrides.shortHookTypes || {}),
        [hookType]: { ...hookConfig, templates: newTemplates },
      },
    });
  }

  function resetHookType(hookType) {
    const { [hookType]: _removed, ...remaining } =
      projectSettingsOverrides.shortHookTypes || {};
    updateProjectOverride({ shortHookTypes: remaining });
  }

  function deleteHookType(hookType) {
    const { [hookType]: _removed, ...remaining } =
      projectSettingsOverrides.shortHookTypes || {};
    updateProjectOverride({ shortHookTypes: remaining });
  }

  function updateHookTypeFlags(hookType, hookConfig, flagUpdates) {
    updateProjectOverride({
      shortHookTypes: {
        ...(projectSettingsOverrides.shortHookTypes || {}),
        [hookType]: { ...hookConfig, ...flagUpdates },
      },
    });
  }

  function addHookType() {
    const label = newLabel.trim();
    if (!label) return;
    const key = slugify(label);
    if (!key || (projectConfig.shortHookTypes || {})[key]) return;
    updateProjectOverride({
      shortHookTypes: {
        ...(projectSettingsOverrides.shortHookTypes || {}),
        [key]: { label, templates: [], excludeForFaithful: false, requiresGenre: false },
      },
    });
    setNewLabel('');
  }

  return (
    <section>
      <h2 className="panel-title">Shorts Hooks</h2>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <input
          className="form-input"
          style={{ flex: '0 0 160px', marginBottom: 0 }}
          placeholder="New hook type label..."
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHookType()}
        />
        <button className="button-secondary" onClick={addHookType} disabled={!newLabel.trim()}>
          + Add
        </button>
        {otherProjects.length > 0 && (
          <TagSyncControls
            projects={otherProjects.map((p) => [p.id, { name: p.name }])}
            syncTargetProjectId={copyTargetId}
            setSyncTargetProjectId={setCopyTargetId}
            onSyncTags={() => syncHookTypesToProject(copyTargetId, projectConfig.shortHookTypes || {})}
            buttonLabel="Sync"
          />
        )}
      </div>

      <div className="tag-library tag-library--3col">
        <article className="tag-card tag-card--settings">
          <header className="tag-card-header">
            <h3>Settings</h3>
            <IconButton icon="↺" title="Reset to defaults" onClick={resetPrimaryTagConfig} />
          </header>
          <PrimaryTagSection config={primaryTagConfig} onUpdate={updatePrimaryTagConfig} />
        </article>

        {hookTypes.map(([hookType, hookConfig]) => {
          const isUserCreated = !(hookType in baseHookTypes);
          return (
            <ShortHookCard
              key={hookType}
              hookType={hookType}
              hookConfig={hookConfig}
              onUpdateTemplates={(newTemplates) =>
                updateHookTypeTemplates(hookType, hookConfig, newTemplates)
              }
              onReset={isUserCreated ? undefined : () => resetHookType(hookType)}
              onRemove={isUserCreated ? () => deleteHookType(hookType) : undefined}
              onUpdateFlags={(flagUpdates) =>
                updateHookTypeFlags(hookType, hookConfig, flagUpdates)
              }
              highlightText={hookTarget?.hookType === hookType ? hookTarget.sourceText : null}
            />
          );
        })}
      </div>

    </section>
  );
}
