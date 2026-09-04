import HookBlockEditor from './HookBlockEditor';
import AddBlockForm from './AddBlockForm';
import useConfirm from '../../../hooks/useConfirm';
import { buildHookPlaceholders } from '../../../utils/hookPlaceholders';
import {
  getTemplates,
  getMaxLines,
  getCountValue,
  getTarget,
  isOverridden,
  getOverrideType,
  getScope,
  getHookBlockCore,
  updateTemplatesPatch,
  resetBlockPatch,
  renameJsonBlockPatch,
  renameDynamicBlockPatch,
  updateOverrideTypePatch,
  updateScopePatch,
  updateTargetPatch,
  updateMaxLinesPatch,
  updateCountPatch,
  toggleHookBlockCorePatch,
  addHookBlockPatch,
  deleteHookBlockPatch,
} from '../../../utils/hookBlockOverrides';

// Hook block definitions live in projects.json → description.hookBlocks.
// Each entry: { key, label, path, templateKey, scope?, countMax?, countDefault?, descriptionLayoutKey? }
// path: 'long' | 'top' (description root) | 'shorts'
// Read/write logic for the per-block override state lives in
// src/utils/hookBlockOverrides.js — this component just wires those pure
// helpers to updateProjectOverride and renders one HookBlockEditor per block.

export default function HookBlocks({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  openBlockKey,
  highlightText,
}) {
  const overriddenDesc = projectSettingsOverrides.description || {};
  const confirm = useConfirm();

  async function deleteHookBlock(key) {
    if (getHookBlockCore(projectSettingsOverrides, key)) return;
    if (!(await confirm({
      title: 'Delete hook block',
      message: `Delete this hook block? This cannot be undone.`,
      confirmLabel: 'Delete',
    }))) return;
    updateProjectOverride(deleteHookBlockPatch(projectSettingsOverrides, key));
  }

  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const placeholders = buildHookPlaceholders(projectConfig);
  const dynamicHookBlockKeys = new Set(
    (overriddenDesc.customHookBlocks || []).map((b) => b.key),
  );

  // Must include the layout-key namespace (descriptionLayoutKey) too, not
  // just hook blocks' own storage keys — see TextBlocks.jsx.
  const existingKeys = [
    ...hookBlocks.map((b) => b.key),
    ...hookBlocks.map((b) => b.descriptionLayoutKey ?? b.key),
    ...Object.keys(customBlocks),
  ];

  return (
    <>
      {hookBlocks.map((block) => {
        const { key } = block;
        const isDynamic = dynamicHookBlockKeys.has(key);
        const effectiveLabel =
          overriddenDesc.hookBlockLabelOverrides?.[key] ?? block.label;
        return (
          <HookBlockEditor
            key={key}
            label={effectiveLabel}
            templates={getTemplates(projectConfig, block)}
            scope={getScope(projectSettingsOverrides, key, block.defaultScope)}
            target={getTarget(projectSettingsOverrides, block)}
            overrideType={getOverrideType(projectSettingsOverrides, key)}
            hasOverride={
              !isDynamic &&
              (isOverridden(projectSettingsOverrides, block) || !!overriddenDesc.hookBlockLabelOverrides?.[key])
            }
            maxLines={getMaxLines(projectSettingsOverrides, block)}
            countValue={getCountValue(projectSettingsOverrides, block)}
            onUpdateTemplates={(t) =>
              updateProjectOverride(updateTemplatesPatch(projectSettingsOverrides, block, t))
            }
            onReset={
              !isDynamic
                ? () => updateProjectOverride(resetBlockPatch(projectSettingsOverrides, block))
                : undefined
            }
            onDelete={isDynamic ? () => deleteHookBlock(key) : undefined}
            isCore={isDynamic ? getHookBlockCore(projectSettingsOverrides, key) : undefined}
            onToggleCore={
              isDynamic
                ? () => updateProjectOverride(toggleHookBlockCorePatch(projectSettingsOverrides, key))
                : undefined
            }
            onRename={
              isDynamic
                ? (newLabel) => updateProjectOverride(renameDynamicBlockPatch(projectSettingsOverrides, key, newLabel))
                : (newLabel) => updateProjectOverride(renameJsonBlockPatch(projectSettingsOverrides, key, newLabel))
            }
            onScopeChange={(val) => updateProjectOverride(updateScopePatch(projectSettingsOverrides, key, val))}
            onTargetChange={(val) => updateProjectOverride(updateTargetPatch(projectSettingsOverrides, key, val))}
            onOverrideTypeChange={(val) => updateProjectOverride(updateOverrideTypePatch(projectSettingsOverrides, key, val))}
            onMaxLinesChange={(val) => updateProjectOverride(updateMaxLinesPatch(projectSettingsOverrides, key, val))}
            onCountChange={(val) => updateProjectOverride(updateCountPatch(projectSettingsOverrides, key, val))}
            open={openBlockKey === key}
            highlightText={openBlockKey === key ? highlightText : null}
            placeholders={placeholders}
          />
        );
      })}
      <AddBlockForm
        placeholder="New hook block name (e.g. Sponsor Hook)"
        existingKeys={existingKeys}
        onAdd={(key, name, scope, target) =>
          updateProjectOverride(addHookBlockPatch(projectSettingsOverrides, key, name, scope, target))
        }
      />
    </>
  );
}
