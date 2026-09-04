import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';

import ToggleButton from '../ui/ToggleButton';
import SortableTagChip from './SortableTagChip';
import { clearOnEscape } from '../../utils/keyboard';

export default function TransformationTagSelector({
  visibleTags,
  tagUsage,
  formData,
  onTagToggle,
  onReorderTags,
  onOpenSourceTag,
  defaultVisibleTagLimit = 6,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState('');

  // 8px pointer threshold: a press that moves less than this stays a plain
  // click (deselect / Ctrl+Click). TouchSensor uses a short press-and-hold so
  // a quick tap still deselects and a fast swipe near a chip still scrolls.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const selectedTagNames = formData.transformationTags || [];
  const normalizedSearch = search.trim().toLowerCase();

  const tagDataByName = new Map(visibleTags);

  const sortedTags = [...visibleTags].sort(
    ([tagA], [tagB]) => (tagUsage[tagB] || 0) - (tagUsage[tagA] || 0),
  );

  // Selected chips render in transformationTags order — that order is
  // intentional priority (first = most important, e.g. drives {primaryTag}).
  // Available chips stay usage-sorted.
  const selectedTags = selectedTagNames
    .filter((tag) => tagDataByName.has(tag))
    .map((tag) => [tag, tagDataByName.get(tag)]);

  const availableTags = sortedTags.filter(([tag, tagData]) => {
    if (selectedTagNames.includes(tag)) return false;

    if (!normalizedSearch) return true;

    const label = tagData.label || tag;

    return (
      tag.toLowerCase().includes(normalizedSearch) ||
      label.toLowerCase().includes(normalizedSearch)
    );
  });

  const visibleAvailableTags = normalizedSearch
    ? availableTags
    : availableTags.slice(0, defaultVisibleTagLimit);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = selectedTagNames.indexOf(active.id);
    const newIndex = selectedTagNames.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorderTags(arrayMove(selectedTagNames, oldIndex, newIndex));
  };

  // Available / unselected chips — plain buttons, no drag.
  const renderTagButton = ([tag, tagData]) => {
    const label = tagData.label || tag;
    const tooltip = tagData.category
      ? `${tagData.category} — Ctrl+Click to open in Tag Library`
      : 'Ctrl+Click to open in Tag Library';

    return (
      <button
        key={tag}
        type="button"
        className="tag-chip"
        data-tooltip={tooltip}
        onClick={(e) => {
          if ((e.ctrlKey || e.metaKey) && onOpenSourceTag) {
            onOpenSourceTag(tag);
            return;
          }

          onTagToggle(tag);
        }}
      >
        {label} ({tagUsage[tag] || 0})
      </button>
    );
  };

  return (
    <div className="form-group tag-section">
      <ToggleButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        label="Transformation Tags"
      />

      {isOpen && (
        <div className="advanced-panel-content tag-selector-details">
          <input
            className="form-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={clearOnEscape(search, () => setSearch(''))}
            placeholder="Search tags..."
          />

          {selectedTags.length > 0 && (
            <div className="tag-selector-group">
              <p className="tag-selector-label">Selected</p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedTags.map(([tag]) => tag)}
                  strategy={rectSortingStrategy}
                >
                  <div className="tag-list">
                    {selectedTags.map(([tag, tagData]) => (
                      <SortableTagChip
                        key={tag}
                        tag={tag}
                        tagData={tagData}
                        tagUsage={tagUsage}
                        onTagToggle={onTagToggle}
                        onOpenSourceTag={onOpenSourceTag}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          <div className="tag-selector-group">
            <p className="tag-selector-label">
              {normalizedSearch
                ? `Matching Tags (${visibleAvailableTags.length})`
                : `Available Tags (${visibleAvailableTags.length} of ${availableTags.length})`}
            </p>

            <div className="tag-list">
              {visibleAvailableTags.map(renderTagButton)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
