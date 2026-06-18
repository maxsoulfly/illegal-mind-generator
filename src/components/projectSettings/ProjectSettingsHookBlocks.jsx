import HookTemplateEditor from '../ui/HookTemplateEditor';
import BlockEditorCard from './blocks/BlockEditorCard';
import AddBlockForm from './blocks/AddBlockForm';
import { generateBlockKey } from '../../utils/customBlocks';

// Hook block definitions live in projects.json → description.hookBlocks.
// Each entry: { key, label, path, templateKey, scope?, countMax?, countDefault?, descriptionLayoutKey? }
// path: 'long' | 'top' (description root) | 'shorts'

function HookBlockEditor({
  label,
  templates,
  scope,
  target,
  hasOverride,
  maxLines,
  countValue,
  onUpdateTemplates,
  onReset,
  onDelete,
  onScopeChange,
  onTargetChange,
  onMaxLinesChange,
  onCountChange,
}) {
  const pct =
    maxLines > 1 ? `${((countValue - 1) / (maxLines - 1)) * 100}%` : '0%';

  return (
    <BlockEditorCard
      label={label}
      badge={`${templates.length} templates`}
      scope={scope}
      target={target}
      onScopeChange={onScopeChange}
      onTargetChange={onTargetChange}
      hasOverride={hasOverride}
      onReset={onReset}
      onDelete={onDelete}
    >
      <div className="tag-phrase-row hook-block-lines-row">
        <span className="form-label">Lines</span>
        {maxLines > 1 ? (
          <input
            type="range"
            min={1}
            max={maxLines}
            value={countValue}
            style={{ '--val': pct }}
            onChange={(e) => onCountChange(Number(e.target.value))}
          />
        ) : (
          <span className="hook-block-lines-empty" />
        )}
        <span className="tag-status">
          {maxLines > 1 ? countValue : '—'}
        </span>
        <label className="hook-block-max-label">
          max
          <input
            key={maxLines}
            type="number"
            min="1"
            className="form-input hook-block-max-input"
            defaultValue={maxLines}
            onBlur={(e) =>
              onMaxLinesChange(
                Math.max(1, parseInt(e.target.value, 10) || 1),
              )
            }
          />
        </label>
      </div>
      <HookTemplateEditor
        templates={templates}
        onUpdateTemplates={onUpdateTemplates}
        noWrapper
      />
    </BlockEditorCard>
  );
}

export default function ProjectSettingsHookBlocks({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const overriddenDesc = projectSettingsOverrides.description || {};
  const overriddenLong =
    projectSettingsOverrides.description?.templates?.long || {};
  const overriddenShorts =
    projectSettingsOverrides.description?.templates?.shorts || {};

  const longTemplates = projectConfig.description?.templates?.long || {};
  const shortsTemplates = projectConfig.description?.templates?.shorts || {};
  const descConfig = projectConfig.description || {};

  function getTemplates({ path, templateKey }) {
    if (path === 'long') return longTemplates[templateKey] || [];
    if (path === 'top') return descConfig[templateKey] || [];
    if (path === 'shorts') return shortsTemplates[templateKey] || [];
    return [];
  }

  function getMaxLines({ key, countMax }) {
    return overriddenDesc.hookBlockMaxLines?.[key] ?? countMax ?? 1;
  }

  function getCountValue(block) {
    const max = getMaxLines(block);
    const stored =
      overriddenDesc.hookBlockCounts?.[block.key] ?? block.countDefault ?? 1;
    return Math.min(stored, max);
  }

  function getTarget({ key, path }) {
    return (
      overriddenDesc.hookBlockTargets?.[key] ??
      (path === 'shorts' ? 'shorts' : 'long')
    );
  }

  function isOverridden({ key, path, templateKey }) {
    const tplOverridden =
      path === 'long'
        ? templateKey in overriddenLong
        : path === 'top'
          ? templateKey in overriddenDesc
          : path === 'shorts'
            ? templateKey in overriddenShorts
            : false;
    return (
      tplOverridden ||
      (overriddenDesc.hookBlockMaxLines != null &&
        key in overriddenDesc.hookBlockMaxLines) ||
      (overriddenDesc.hookBlockCounts != null &&
        key in overriddenDesc.hookBlockCounts) ||
      (overriddenDesc.hookBlockTargets != null &&
        key in overriddenDesc.hookBlockTargets)
    );
  }

  function updateTemplates({ path, templateKey }, newTemplates) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    if (path === 'long') {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          templates: {
            ...templates_,
            long: { ...overriddenLong, [templateKey]: newTemplates },
          },
        },
      });
    } else if (path === 'top') {
      updateProjectOverride({
        description: { ...overriddenDesc, [templateKey]: newTemplates },
      });
    } else if (path === 'shorts') {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          templates: {
            ...templates_,
            shorts: { ...overriddenShorts, [templateKey]: newTemplates },
          },
        },
      });
    }
  }

  function resetBlock({ key, path, templateKey }) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    const { [key]: _mx, ...remainingMaxLines } =
      overriddenDesc.hookBlockMaxLines || {};
    const { [key]: _cv, ...remainingCounts } =
      overriddenDesc.hookBlockCounts || {};
    const { [key]: _tgt, ...remainingTargets } =
      overriddenDesc.hookBlockTargets || {};

    if (path === 'long') {
      const { [templateKey]: _t, ...remainingLong } = overriddenLong;
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts: remainingCounts,
          hookBlockTargets: remainingTargets,
          templates: { ...templates_, long: remainingLong },
        },
      });
    } else if (path === 'top') {
      const { [templateKey]: _t, ...remaining } = overriddenDesc;
      updateProjectOverride({
        description: {
          ...remaining,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts: remainingCounts,
          hookBlockTargets: remainingTargets,
        },
      });
    } else if (path === 'shorts') {
      const { [templateKey]: _t, ...remainingShorts } = overriddenShorts;
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts: remainingCounts,
          hookBlockTargets: remainingTargets,
          templates: { ...templates_, shorts: remainingShorts },
        },
      });
    }
  }

  function getScope(key) {
    return overriddenLong.phraseBlockScopes?.[key] ?? 'project';
  }

  function updateScope(key, scope) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        templates: {
          ...templates_,
          long: {
            ...overriddenLong,
            phraseBlockScopes: {
              ...(overriddenLong.phraseBlockScopes || {}),
              [key]: scope,
            },
          },
        },
      },
    });
  }

  function updateTarget(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockTargets: {
          ...(overriddenDesc.hookBlockTargets || {}),
          [key]: value,
        },
      },
    });
  }

  function updateMaxLines(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockMaxLines: {
          ...(overriddenDesc.hookBlockMaxLines || {}),
          [key]: value,
        },
      },
    });
  }

  function updateCount(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockCounts: {
          ...(overriddenDesc.hookBlockCounts || {}),
          [key]: value,
        },
      },
    });
  }

  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const dynamicHookBlockKeys = new Set(
    (overriddenDesc.customHookBlocks || []).map((b) => b.key),
  );

  function addHookBlock(key, name, scope, target) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customHookBlocks: [
          ...(overriddenDesc.customHookBlocks || []),
          { key, label: name },
        ],
        hookBlockTargets: { ...(overriddenDesc.hookBlockTargets || {}), [key]: target },
        templates: {
          ...templates_,
          long: {
            ...overriddenLong,
            phraseBlockScopes: {
              ...(overriddenLong.phraseBlockScopes || {}),
              [key]: scope,
            },
          },
        },
      },
    });
  }

  function deleteHookBlock(key) {
    if (!window.confirm(`Delete this hook block? This cannot be undone.`)) return;
    const templates_ = projectSettingsOverrides.description?.templates || {};
    const { [key]: _tpl, ...remainingLongBase } = overriddenLong;
    const { [key]: _sc, ...remainingScopes } = overriddenLong.phraseBlockScopes || {};
    const { [key]: _mx, ...remainingMaxLines } = overriddenDesc.hookBlockMaxLines || {};
    const { [key]: _cv, ...remainingCounts } = overriddenDesc.hookBlockCounts || {};
    const { [key]: _tgt, ...remainingTargets } = overriddenDesc.hookBlockTargets || {};
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customHookBlocks: (overriddenDesc.customHookBlocks || []).filter(
          (b) => b.key !== key,
        ),
        hookBlockMaxLines: remainingMaxLines,
        hookBlockCounts: remainingCounts,
        hookBlockTargets: remainingTargets,
        templates: {
          ...templates_,
          long: { ...remainingLongBase, phraseBlockScopes: remainingScopes },
        },
      },
    });
  }

  const existingKeys = [
    ...hookBlocks.map((b) => b.key),
    ...Object.keys(customBlocks),
  ];

  return (
    <>
      {hookBlocks.map((block) => {
        const { key } = block;
        const isDynamic = dynamicHookBlockKeys.has(key);
        return (
          <HookBlockEditor
            key={key}
            label={block.label}
            templates={getTemplates(block)}
            scope={getScope(key)}
            target={getTarget(block)}
            hasOverride={!isDynamic && isOverridden(block)}
            maxLines={getMaxLines(block)}
            countValue={getCountValue(block)}
            onUpdateTemplates={(t) => updateTemplates(block, t)}
            onReset={!isDynamic ? () => resetBlock(block) : undefined}
            onDelete={isDynamic ? () => deleteHookBlock(key) : undefined}
            onScopeChange={(val) => updateScope(key, val)}
            onTargetChange={(val) => updateTarget(key, val)}
            onMaxLinesChange={(val) => updateMaxLines(key, val)}
            onCountChange={(val) => updateCount(key, val)}
          />
        );
      })}
      <AddBlockForm
        placeholder="New hook block name (e.g. Sponsor Hook)"
        existingKeys={existingKeys}
        onAdd={addHookBlock}
      />
    </>
  );
}
