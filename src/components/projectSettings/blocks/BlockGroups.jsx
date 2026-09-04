import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import BlockEditorCard from './BlockEditorCard';
import AddBlockForm from './AddBlockForm';
import BlockInfoCard from '../../ui/BlockInfoCard';
import useConfirm from '../../../hooks/useConfirm';
import SortableActiveBlock from '../descriptions/SortableActiveBlock';
import { isListBlock, isTextBlock, BLOCK_TYPE_SUBTABS } from '../../../utils/customBlocks';
import { makeBlockKeyLabelResolver, resolveBlockSource, buildHookBlockMaps } from '../../../utils/descriptionLayout';
import {
  isDynamicGroup,
  patchGroupPatch,
  resetGroupPatch,
  deleteGroupPatch,
  addGroupPatch,
} from '../../../utils/blockGroupOverrides';

// Block Groups are a shell: { key, label, scope, target, children }. A child
// is { type: 'block', key } — an existing List/Text/Hook Block, joined tight
// with the rest of the group's children (see generateBlockGroups in
// resolveLayoutBlocks.js). A block assigned to a group is exclusive to it —
// it stops appearing independently in the Descriptions layout builder (see
// LongDescriptionSettings.jsx/ShortsDescriptionSettings.jsx's groupChildKeys
// filter) but stays fully editable wherever it normally lives.
function AddChildList({ candidateKeys, getBlockKeyLabel, onAdd }) {
  const [searchText, setSearchText] = useState('');
  const visibleKeys = candidateKeys.filter((key) =>
    getBlockKeyLabel(key).toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <>
      <p className="desc-col-label">Add child</p>
      <input
        className="form-input"
        type="search"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <div className="desc-available-list">
        {visibleKeys.map((key) => (
          <BlockInfoCard key={key} label={getBlockKeyLabel(key)} onAdd={() => onAdd(key)} />
        ))}
      </div>
    </>
  );
}

export default function BlockGroups({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  openBlockKey,
  onNavigateToBlock,
}) {
  const confirm = useConfirm();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const overriddenDesc = projectSettingsOverrides.description || {};
  const blockGroups = projectConfig.description?.blockGroups || [];
  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const supportBlockConfig = projectConfig.description?.templates?.long?.supportBlock;
  const hookBlockMaps = buildHookBlockMaps(hookBlocks);

  const getBlockKeyLabel = makeBlockKeyLabelResolver({
    hookBlocks,
    hookBlockLabelOverrides: overriddenDesc.hookBlockLabelOverrides || {},
    blockLabelOverrides: overriddenDesc.blockLabelOverrides || {},
    customBlocks,
  });

  // A group's children are always Hook/List/Text blocks, never another
  // group — no blockGroupMaps needed to disambiguate their own type.
  function getChildNavigateHandler(childKey) {
    if (!onNavigateToBlock) return undefined;
    const source = resolveBlockSource(childKey, { hookBlockMaps, customBlocks, supportBlockConfig });
    if (!source) return undefined;
    const subTab = BLOCK_TYPE_SUBTABS[source.blockType]?.subTab;
    return () => onNavigateToBlock({ subTab, blockKey: source.blockKey });
  }

  const isDynamic = (key) => isDynamicGroup(overriddenDesc, key);

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
    updateProjectOverride(patchGroupPatch(overriddenDesc, group, patch, isDynamic(group.key)));
  }

  function resetGroup(key) {
    updateProjectOverride(resetGroupPatch(overriddenDesc, key));
  }

  async function deleteGroup(group) {
    if (group.isCore) return;
    if (!(await confirm({
      title: 'Delete group',
      message: 'Delete this block group? Its children become independently placeable again. This cannot be undone.',
      confirmLabel: 'Delete Group',
    }))) return;
    updateProjectOverride(deleteGroupPatch(overriddenDesc, group));
  }

  function addGroup(key, name, scope, target) {
    updateProjectOverride(addGroupPatch(overriddenDesc, key, name, scope, target));
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

  function handleChildDragEnd(group, event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = group.children.findIndex((c) => c.key === active.id);
    const newIndex = group.children.findIndex((c) => c.key === over.id);
    patchGroup(group, { children: arrayMove(group.children, oldIndex, newIndex) });
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
            onDelete={dynamic ? () => deleteGroup(group) : undefined}
            isCore={dynamic ? group.isCore : undefined}
            onToggleCore={dynamic ? () => patchGroup(group, { isCore: !group.isCore }) : undefined}
            onRename={(newLabel) => patchGroup(group, { label: newLabel })}
            open={openBlockKey === group.key}
          >
            <div className="desc-layout-active">
              {group.children.length === 0 && (
                <p className="tag-summary">No children yet — add one below.</p>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleChildDragEnd(group, event)}
              >
                <SortableContext
                  items={group.children.map((c) => c.key)}
                  strategy={verticalListSortingStrategy}
                >
                  {group.children.map((child, index) => (
                    <SortableActiveBlock
                      key={child.key}
                      id={child.key}
                      label={getBlockKeyLabel(child.key)}
                      onRemove={() => removeChild(group, child.key)}
                      onNavigate={getChildNavigateHandler(child.key)}
                      disabledUp={index === 0}
                      disabledDown={index === group.children.length - 1}
                      onMoveUp={() => moveChild(group, index, -1)}
                      onMoveDown={() => moveChild(group, index, 1)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            {candidateKeys.length > 0 && (
              <AddChildList
                candidateKeys={candidateKeys}
                getBlockKeyLabel={getBlockKeyLabel}
                onAdd={(key) => addChild(group, key)}
              />
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
