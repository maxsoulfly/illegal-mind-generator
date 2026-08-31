import { useCallback, useEffect, useState } from 'react';

import { apiDelete, apiGet, apiPut } from '../utils/apiClient';
import {
  toIsoDate,
  getWeekday,
  getMonthGridDays,
  addDays,
  isBeforeToday,
} from '../utils/calendarDates';

// Persistence migration Step 10: upload-calendar slots now live in Postgres,
// reached through the local API (Vite proxies /api/* and attaches auth — see
// vite.config.js). Same async shape as the other migrated hooks. localStorage
// is no longer read or written here; the old `uploadCalendar` blob stays
// untouched as a fallback/reference until the migration's final cleanup step.
// The pure derivation functions below are unchanged and still run client-side.
// See C:\Users\Max\.claude\plans\one-signal-many-terminals.md.

const MAX_SCAN_DAYS = 90;
const EMPTY_OBJECT = {};

export function buildSlotKey(isoDate, videoType) {
  return `${isoDate}|${videoType}`;
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

// GET /upload-calendar returns a slot array; the pure functions above want the
// `{ slotKey: { plannedEntryId, uploadedEntryId } }` map shape.
function slotsArrayToMap(slotArray) {
  return Object.fromEntries(
    (slotArray || []).map((s) => [
      buildSlotKey(s.isoDate, s.videoType),
      { plannedEntryId: s.plannedEntryId, uploadedEntryId: s.uploadedEntryId },
    ]),
  );
}

const calendarPath = (projectId) =>
  `/upload-calendar?project=${encodeURIComponent(projectId)}`;

export function useUploadCalendar(projectId, savedEntries = [], scheduleConfig = {}) {
  // `result.projectId` is the project the loaded slots belong to. Deriving
  // `loading` from a mismatch (rather than a `loading` state set inside the
  // effect) keeps the effect free of synchronous setState. A reload() for the
  // same project keeps the id matching → silent background resync; a project
  // switch flips the mismatch → the page shows its loading state.
  const [result, setResult] = useState({
    projectId: null,
    slots: EMPTY_OBJECT,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    apiGet(calendarPath(projectId))
      .then((data) => {
        if (!cancelled) {
          setResult({ projectId, slots: slotsArrayToMap(data?.slots), error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ projectId, slots: EMPTY_OBJECT, error: err });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  const isCurrent = result.projectId === projectId;
  const slots = isCurrent ? result.slots : EMPTY_OBJECT;
  const error = isCurrent ? result.error : null;
  const loading = !isCurrent;

  function getSlot(isoDate, videoType) {
    return slots[buildSlotKey(isoDate, videoType)] || null;
  }

  // Applies the same merge/delete-when-empty rule to a slots map that the old
  // synchronous patchSlot did, so callers see the optimistic result instantly.
  function applyPatchToMap(map, isoDate, videoType, patch) {
    const key = buildSlotKey(isoDate, videoType);
    const current = map[key] || { plannedEntryId: null, uploadedEntryId: null };
    const next = { ...current, ...patch };

    const nextMap = { ...map };
    if (!next.plannedEntryId && !next.uploadedEntryId) {
      delete nextMap[key];
    } else {
      nextMap[key] = next;
    }
    return nextMap;
  }

  async function patchSlot(isoDate, videoType, patch) {
    setResult((prev) => ({
      ...prev,
      slots: applyPatchToMap(prev.slots, isoDate, videoType, patch),
    }));

    try {
      const { slot } = await apiPut('/upload-calendar/slot', {
        projectId,
        isoDate,
        videoType,
        patch,
      });

      setResult((prev) => {
        const key = buildSlotKey(isoDate, videoType);
        const nextMap = { ...prev.slots };
        if (slot) {
          nextMap[key] = {
            plannedEntryId: slot.plannedEntryId,
            uploadedEntryId: slot.uploadedEntryId,
          };
        } else {
          delete nextMap[key];
        }
        return { ...prev, slots: nextMap };
      });
    } catch {
      // Silent resync — drops the optimistic change back to server truth.
      reload();
    }
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

  async function removeSlot(isoDate, videoType) {
    setResult((prev) => {
      const key = buildSlotKey(isoDate, videoType);
      if (!(key in prev.slots)) return prev;
      const nextMap = { ...prev.slots };
      delete nextMap[key];
      return { ...prev, slots: nextMap };
    });

    try {
      await apiDelete(
        `/upload-calendar/slot?project=${encodeURIComponent(projectId)}` +
          `&isoDate=${encodeURIComponent(isoDate)}&videoType=${encodeURIComponent(videoType)}`,
      );
    } catch {
      reload();
    }
  }

  function addToNextOpenSlot(entryId, videoType) {
    // Guard: don't compute a target against a slot map that hasn't loaded yet
    // — it could place a plan into a slot that's actually occupied in the DB.
    if (loading) return null;

    const target = findNextOpenSlot(slots, scheduleConfig, videoType, toIsoDate(new Date()));
    if (!target) return null;

    setPlannedEntry(target.isoDate, target.videoType, entryId);
    return target;
  }

  return {
    loading,
    error,
    reload,
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
