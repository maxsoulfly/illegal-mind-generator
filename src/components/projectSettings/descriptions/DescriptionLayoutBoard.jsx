import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import BlockInfoCard from '../../ui/BlockInfoCard';
import SubTabNav from '../../ui/SubTabNav';
import IconButton from '../../ui/IconButton';
import SortableActiveBlock from './SortableActiveBlock';

const MOBILE_COLUMN_TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'available', label: 'Available' },
];

// Shared Available/Active two-column block layout board for the Long and
// Shorts Description settings pages — mobile tab switcher, header row with
// Reset Order, drag-and-drop Active column (dnd-kit), plain Available list.
// Pairs with useDescriptionLayoutActions.js, which supplies sensors/handlers.
export default function DescriptionLayoutBoard({
  availableKeys,
  activeKeys,
  sensors,
  onDragEnd,
  onResetOrder,
  getLayoutBlockLabel,
  getNavigateHandler,
  addToLayout,
  removeFromLayout,
  moveBlock,
}) {
  const [mobileTab, setMobileTab] = useState('layout');

  return (
    <>
      <SubTabNav
        tabs={MOBILE_COLUMN_TABS}
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        className="desc-mobile-tabs"
      />

      <div className="desc-layout-header">
        <span className="desc-col-label">Available</span>
        <div className="desc-active-header">
          <span>Active Layout</span>
          <IconButton
            icon="↺ Reset Order"
            title="Reset to default order"
            onClick={onResetOrder}
          />
        </div>
      </div>

      <div className="desc-layout" data-mobile-tab={mobileTab}>
        <aside className="desc-layout-available">
          {availableKeys.length === 0 ? (
            <p className="tag-summary">All blocks are in the layout.</p>
          ) : (
            <div className="desc-available-list">
              {availableKeys.map((key) => (
                <BlockInfoCard
                  key={key}
                  label={getLayoutBlockLabel(key)}
                  onAdd={() => addToLayout(key)}
                  onNavigate={getNavigateHandler(key)}
                />
              ))}
            </div>
          )}
        </aside>

        <div className="desc-layout-active">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={activeKeys} strategy={verticalListSortingStrategy}>
              {activeKeys.map((key, i) => (
                <SortableActiveBlock
                  key={key}
                  id={key}
                  label={getLayoutBlockLabel(key)}
                  onRemove={() => removeFromLayout(key)}
                  onNavigate={getNavigateHandler(key)}
                  disabledUp={i === 0}
                  disabledDown={i === activeKeys.length - 1}
                  onMoveUp={() => moveBlock(key, -1)}
                  onMoveDown={() => moveBlock(key, 1)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </>
  );
}
