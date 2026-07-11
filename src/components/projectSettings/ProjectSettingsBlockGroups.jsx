import BlockEditorCard from './blocks/BlockEditorCard';
import AddBlockForm from './blocks/AddBlockForm';
import BlockInfoCard from '../ui/BlockInfoCard';
import MoveControls from '../ui/MoveControls';
import { isListBlock, isTextBlock } from '../../utils/customBlocks';
import { makeBlockKeyLabelResolver } from '../../utils/descriptionLayout';

// Block Groups are a shell: { key, label, scope, target, children }. A child
// is { type: 'block', key } — an existing List/Text/Hook Block, joined tight
// with the rest of the group's children (see generateBlockGroups in
// generateCustomBlocks.js). A block assigned to a group is exclusive to it —
// it stops appearing independently in the Descriptions layout builder (see
// LongDescriptionSettings.jsx/ShortsDescriptionSettings.jsx's groupChildKeys
// filter) but stays fully editable wherever it normally lives.
export default function ProjectSettingsBlockGroups({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  openBlockKey,
}) {
  const overriddenDesc = projectSettingsOverrides.description || {};
  const blockGroups = projectConfig.description?.blockGroups || [];
  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};

  const getBlockKeyLabel = makeBlockKeyLabelResolver({
    hookBlocks,
    hookBlockLabelOverrides: overriddenDesc.hookBlockLabelOverrides || {},
    blockLabelOverrides: overriddenDesc.blockLabelOverrides || {},
    customBlocks,
  });

  const dynamicGroupKeys = new Set((overriddenDesc.customBlockGroups || []).map((g) => g.key));
  const isDynamic = (key) => dynamicGroupKeys.has(key);

  // A block can only belong to one group at a time — the "+ add child"
  // picker for every group is scoped against this same set, computed once
  // since membership is global, not per-group.
  const allGroupChildKeys = new Set(
    blockGroups.flatMap((g) => g.children.filter((c) => c.type === 'block').map((c) => c.key)),
  );
  const candidateKeys = [
    ...Object.keys(customBlocks).filter(
      (key) => (isListBlock(customBlocks[key]) || isTextBlock(customBlocks[key])) && !allGroupChildKeys.has(key),
    ),
    ...hookBlocks.map((b) => b.key).filter((key) => !allGroupChildKeys.has(key)),
  ];

  function patchGroup(group, patch) {
    if (isDynamic(group.key)) {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          customBlockGroups: (overriddenDesc.customBlockGroups || []).map((g) =>
            g.key === group.key ? { ...g, ...patch } : g,
          ),
        },
      });
    } else {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          blockGroupOverrides: {
            ...(overriddenDesc.blockGroupOverrides || {}),
            [group.key]: { ...(overriddenDesc.blockGroupOverrides?.[group.key] || {}), ...patch },
          },
        },
      });
    }
  }

  function resetGroup(key) {
    const { [key]: _removed, ...remaining } = overriddenDesc.blockGroupOverrides || {};
    updateProjectOverride({ description: { ...overriddenDesc, blockGroupOverrides: remaining } });
  }

  function deleteGroup(key) {
    if (!window.confirm('Delete this block group? Its children become independently placeable again. This cannot be undone.')) return;
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customBlockGroups: (overriddenDesc.customBlockGroups || []).filter((g) => g.key !== key),
      },
    });
  }

  function addGroup(key, name, scope, target) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customBlockGroups: [
          ...(overriddenDesc.customBlockGroups || []),
          { key, label: name, scope, target, children: [] },
        ],
      },
    });
  }

  function addChild(group, childKey) {
    patchGroup(group, { children: [...group.children, { type: 'block', key: childKey }] });
  }

  function removeChild(group, childKey) {
    patchGroup(group, { children: group.children.filter((c) => c.key !== childKey) });
  }

  function moveChild(group, index, direction) {
    const next = [...group.children];
    const [item] = next.splice(index, 1);
    next.splice(index + direction, 0, item);
    patchGroup(group, { children: next });
  }

  // Must cover all four namespaces a new group's key could collide with:
  // customBlocks, hook blocks' own keys, hook blocks' descriptionLayoutKeys,
  // and other groups' keys.
  const existingKeys = [
    ...Object.keys(customBlocks),
    ...hookBlocks.map((b) => b.key),
    ...hookBlocks.map((b) => b.descriptionLayoutKey ?? b.key),
    ...blockGroups.map((g) => g.key),
  ];

  return (
    <>
      {blockGroups.map((group) => {
        const dynamic = isDynamic(group.key);
        return (
          <BlockEditorCard
            key={group.key}
            label={group.label}
            badge={`${group.children.length} ${group.children.length === 1 ? 'child' : 'children'}`}
            scope={group.scope}
            target={group.target}
            onScopeChange={(val) => patchGroup(group, { scope: val })}
            onTargetChange={(val) => patchGroup(group, { target: val })}
            hasOverride={!dynamic && !!overriddenDesc.blockGroupOverrides?.[group.key]}
            onReset={!dynamic ? () => resetGroup(group.key) : undefined}
            onDelete={dynamic ? () => deleteGroup(group.key) : undefined}
            onRename={(newLabel) => patchGroup(group, { label: newLabel })}
            open={openBlockKey === group.key}
          >
            <div className="desc-layout-active">
              {group.children.length === 0 && (
                <p className="tag-summary">No children yet — add one below.</p>
              )}
              {group.children.map((child, index) => (
                <div key={child.key} className="desc-block-wrapper">
                  <MoveControls
                    className="desc-block-move-controls"
                    disabledUp={index === 0}
                    disabledDown={index === group.children.length - 1}
                    onMoveUp={() => moveChild(group, index, -1)}
                    onMoveDown={() => moveChild(group, index, 1)}
                  />
                  <BlockInfoCard
                    label={getBlockKeyLabel(child.key)}
                    onRemove={() => removeChild(group, child.key)}
                  />
                </div>
              ))}
            </div>

            {candidateKeys.length > 0 && (
              <>
                <p className="desc-col-label">Add child</p>
                <div className="desc-available-list">
                  {candidateKeys.map((key) => (
                    <BlockInfoCard
                      key={key}
                      label={getBlockKeyLabel(key)}
                      onAdd={() => addChild(group, key)}
                    />
                  ))}
                </div>
              </>
            )}
          </BlockEditorCard>
        );
      })}
      <AddBlockForm
        placeholder="New group name (e.g. Closing)"
        existingKeys={existingKeys}
        onAdd={addGroup}
      />
    </>
  );
}
