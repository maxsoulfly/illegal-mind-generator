import { useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';
import {
  toIsoDate,
  getWeekday,
  getMonthGridDays,
  addDays,
  isBeforeToday,
} from '../utils/calendarDates';

const MAX_SCAN_DAYS = 90;

export function buildSlotKey(isoDate, videoType) {
  return `${isoDate}|${videoType}`;
}

function getStoredSlots(projectId) {
  return loadAppStorage().uploadCalendar[projectId] || {};
}

function saveStoredSlots(projectId, slots) {
  updateAppStorage((storage) => ({
    ...storage,
    uploadCalendar: {
      ...storage.uploadCalendar,
      [projectId]: slots,
    },
  }));
}

// Pure — derives display status from the two independent nullable fields.
// Never stored; recomputed on every read so "missed" naturally appears once
// a planned-but-unconfirmed date passes, with no background job needed.
export function deriveSlotStatus({ plannedEntryId, uploadedEntryId, isoDate }) {
  if (!plannedEntryId && !uploadedEntryId) return 'empty';

  if (uploadedEntryId) {
    if (!plannedEntryId || uploadedEntryId === plannedEntryId) return 'uploaded';
    return 'uploaded-drift';
  }

  return isBeforeToday(isoDate) ? 'missed' : 'planned';
}

// Pure — no React, no storage I/O. Everything the hook needs to compute
// derived data takes slots/scheduleConfig/savedEntries as plain arguments,
// so this is directly Node-testable without a React dispatcher.

export function getScheduledSlotsForWeekday(scheduleConfig, weekday) {
  return (scheduleConfig.slots || []).filter((slot) => slot.weekday === weekday);
}

export function findNextOpenSlot(slots, scheduleConfig, videoType, fromIsoDate) {
  const matchingWeekdays = (scheduleConfig.slots || [])
    .filter((slot) => slot.videoType === videoType)
    .map((slot) => slot.weekday);

  if (!matchingWeekdays.length) return null;

  let cursor = fromIsoDate;
  for (let i = 0; i < MAX_SCAN_DAYS; i += 1) {
    if (matchingWeekdays.includes(getWeekday(cursor))) {
      const slot = slots[buildSlotKey(cursor, videoType)];
      if (!slot?.plannedEntryId && !slot?.uploadedEntryId) {
        return { isoDate: cursor, videoType };
      }
    }
    cursor = addDays(cursor, 1);
  }

  return null;
}

function resolveEntry(savedEntries, entryId) {
  if (!entryId) return null;
  return savedEntries.find((entry) => entry.id === entryId) || null;
}

export function getMonthGrid(slots, scheduleConfig, savedEntries, year, month) {
  return getMonthGridDays(year, month).map(({ isoDate, inCurrentMonth }) => {
    const weekday = getWeekday(isoDate);
    const scheduledSlots = getScheduledSlotsForWeekday(scheduleConfig, weekday);

    const dayKeys = Object.keys(slots).filter((key) => key.startsWith(`${isoDate}|`));
    const scheduledTypes = new Set(scheduledSlots.map((slot) => slot.videoType));
    const adHocTypes = dayKeys
      .map((key) => key.slice(isoDate.length + 1))
      .filter((videoType) => !scheduledTypes.has(videoType));

    const allTypesForDay = [
      ...scheduledSlots.map((slot) => slot.videoType),
      ...adHocTypes,
    ];

    const calendarSlots = allTypesForDay.map((videoType) => {
      const slot = slots[buildSlotKey(isoDate, videoType)] || {
        plannedEntryId: null,
        uploadedEntryId: null,
      };
      const scheduledSlot = scheduledSlots.find((s) => s.videoType === videoType);

      return {
        slotKey: buildSlotKey(isoDate, videoType),
        videoType,
        title: scheduledSlot?.title || null,
        plannedEntry: resolveEntry(savedEntries, slot.plannedEntryId),
        uploadedEntry: resolveEntry(savedEntries, slot.uploadedEntryId),
        status: deriveSlotStatus({ ...slot, isoDate }),
      };
    });

    return {
      isoDate,
      inCurrentMonth,
      scheduledSlots,
      calendarSlots,
    };
  });
}

export function useUploadCalendar(projectId, savedEntries = [], scheduleConfig = {}) {
  const [slots, setSlots] = useState(() => getStoredSlots(projectId));

  // Functional-updater form — required because callers (e.g. a bulk-import
  // apply handler) can invoke multiple slot-mutating calls synchronously in
  // one loop. A plain `setSlots(nextSlots)` computed from the render-time
  // `slots` closure would have every call in the loop compute its patch from
  // the same stale snapshot, so only the last call's write would survive —
  // in both React state AND localStorage, since saveStoredSlots is handed
  // that same stale-derived nextSlots. Chaining through prevSlots fixes both.
  function updateSlots(updater) {
    setSlots((prevSlots) => {
      const nextSlots = typeof updater === 'function' ? updater(prevSlots) : updater;
      saveStoredSlots(projectId, nextSlots);
      return nextSlots;
    });
  }

  function patchSlot(isoDate, videoType, patch) {
    updateSlots((prevSlots) => {
      const key = buildSlotKey(isoDate, videoType);
      const current = prevSlots[key] || { plannedEntryId: null, uploadedEntryId: null };
      const next = { ...current, ...patch };

      const nextSlots = { ...prevSlots };
      if (!next.plannedEntryId && !next.uploadedEntryId) {
        delete nextSlots[key];
      } else {
        nextSlots[key] = next;
      }

      return nextSlots;
    });
  }

  function getSlot(isoDate, videoType) {
    return slots[buildSlotKey(isoDate, videoType)] || null;
  }

  function setPlannedEntry(isoDate, videoType, entryId) {
    patchSlot(isoDate, videoType, { plannedEntryId: entryId });
  }

  function setUploadedEntry(isoDate, videoType, entryId) {
    patchSlot(isoDate, videoType, { uploadedEntryId: entryId });
  }

  function confirmUploadedAsPlanned(isoDate, videoType) {
    const slot = getSlot(isoDate, videoType);
    if (!slot?.plannedEntryId) return;
    patchSlot(isoDate, videoType, { uploadedEntryId: slot.plannedEntryId });
  }

  function clearPlannedEntry(isoDate, videoType) {
    patchSlot(isoDate, videoType, { plannedEntryId: null });
  }

  function clearUploadedEntry(isoDate, videoType) {
    patchSlot(isoDate, videoType, { uploadedEntryId: null });
  }

  function removeSlot(isoDate, videoType) {
    updateSlots((prevSlots) => {
      const key = buildSlotKey(isoDate, videoType);
      if (!(key in prevSlots)) return prevSlots;

      const nextSlots = { ...prevSlots };
      delete nextSlots[key];
      return nextSlots;
    });
  }

  function addToNextOpenSlot(entryId, videoType) {
    const target = findNextOpenSlot(slots, scheduleConfig, videoType, toIsoDate(new Date()));
    if (!target) return null;

    setPlannedEntry(target.isoDate, target.videoType, entryId);
    return target;
  }

  return {
    getMonthGrid: (year, month) => getMonthGrid(slots, scheduleConfig, savedEntries, year, month),
    getSlot,
    findNextOpenSlot: (videoType, fromIsoDate = toIsoDate(new Date())) =>
      findNextOpenSlot(slots, scheduleConfig, videoType, fromIsoDate),
    setPlannedEntry,
    setUploadedEntry,
    confirmUploadedAsPlanned,
    clearPlannedEntry,
    clearUploadedEntry,
    removeSlot,
    addToNextOpenSlot,
  };
}
