import { useCallback, useEffect, useState } from 'react';

import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../utils/apiClient';
import {
  buildEntryFromFormData,
  buildFormDataPatchFromEntry,
  toSlug,
} from '../utils/savedEntries';

// Persistence migration Step 9: saved entries now live in Postgres, reached
// through the local API (Vite proxies /api/* and attaches auth — see
// vite.config.js). Same async shape as useTagOverrides / useProjectOverrides.
// localStorage is no longer read or written here; the old `savedEntries` blob
// stays untouched as a fallback/reference until the migration's final cleanup
// step. The non-destructive import merge (mergeImportedEntry) and the bulk-add
// dedup now run server-side — see server/routes/savedEntries.js.
// See C:\Users\Max\.claude\plans\one-signal-many-terminals.md.

const EMPTY_ARRAY = [];

const entriesPath = (projectId) =>
  `/saved-entries?project=${encodeURIComponent(projectId)}`;

function useSavedEntries(formData, setFormData, selectedProjectId, projectName) {
  // `result.projectId` is the project the loaded entries belong to. Deriving
  // `loading` from a mismatch (rather than a `loading` state set inside the
  // effect) keeps the effect free of synchronous setState. A reload() for the
  // same project keeps the id matching → silent background resync; a project
  // switch flips the mismatch → the App load gate shows.
  const [result, setResult] = useState({
    projectId: null,
    entries: EMPTY_ARRAY,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    apiGet(entriesPath(selectedProjectId))
      .then((data) => {
        if (!cancelled) {
          setResult({
            projectId: selectedProjectId,
            entries: Array.isArray(data) ? data : EMPTY_ARRAY,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ projectId: selectedProjectId, entries: EMPTY_ARRAY, error: err });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, reloadToken]);

  const isCurrent = result.projectId === selectedProjectId;
  const savedEntries = isCurrent ? result.entries : EMPTY_ARRAY;
  const error = isCurrent ? result.error : null;
  const loading = !isCurrent;

  // Optimistic prepend/replace — matches the old `[entry, ...filter(id)]`
  // shape (newest first, dedup by id).
  const putEntryLocal = (entry) =>
    setResult((prev) => ({
      ...prev,
      entries: [entry, ...prev.entries.filter((e) => e.id !== entry.id)],
    }));

  // Save — targetProjectId lets the Generator save into a project other than
  // the one being viewed (defaults to the active one). Returns a small
  // outcome signal for the caller's toast: `true` persisted, `false` the
  // request failed (already resynced here), `null` nothing was attempted
  // (no artist/song). Persistence/optimistic/resync behaviour is unchanged —
  // these are just added return values; the catch still swallows the error.
  const handleSaveEntry = async (targetProjectId = selectedProjectId) => {
    const entry = buildEntryFromFormData(formData);
    if (!entry.artist || !entry.song) return null;

    const savingToCurrent = targetProjectId === selectedProjectId;
    if (savingToCurrent) putEntryLocal(entry);

    try {
      const saved = await apiPut(`/saved-entries/${encodeURIComponent(entry.id)}`, {
        projectId: targetProjectId,
        entry,
      });
      if (savingToCurrent) putEntryLocal(saved);
      return true;
    } catch {
      if (savingToCurrent) reload();
      return false;
    }
  };

  // Load — pure formData patch, no persistence.
  const handleLoadEntry = (entry) => {
    setFormData((prev) => buildFormDataPatchFromEntry(entry, prev));
  };

  const handleDeleteEntry = async (entryId) => {
    setResult((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== entryId),
    }));

    try {
      await apiDelete(
        `/saved-entries/${encodeURIComponent(entryId)}?project=${encodeURIComponent(selectedProjectId)}`,
      );
    } catch {
      reload();
    }
  };

  // Export — reads the local array, builds a download. Unchanged.
  const handleExportEntries = () => {
    const blob = new Blob([JSON.stringify(savedEntries, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toSlug(projectName)}-library.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import — the non-destructive merge (mergeImportedEntry) runs server-side;
  // the response carries the full refreshed list.
  const handleImportEntries = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) return;

        const { entries } = await apiPost('/saved-entries/import', {
          projectId: selectedProjectId,
          items: parsed,
        });

        setResult((prev) => ({
          ...prev,
          entries: Array.isArray(entries) ? entries : prev.entries,
        }));
      } catch (importError) {
        console.error('Failed to import library:', importError);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleUpdateEntryTodo = async (entryId, todo) => {
    const nextTodo = { status: todo.status || '', notes: todo.notes || '' };

    setResult((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === entryId ? { ...e, todo: nextTodo } : e,
      ),
    }));

    try {
      const updated = await apiPatch(
        `/saved-entries/${encodeURIComponent(entryId)}/todo`,
        { projectId: selectedProjectId, ...nextTodo },
      );
      if (updated) {
        setResult((prev) => ({
          ...prev,
          entries: prev.entries.map((e) => (e.id === entryId ? updated : e)),
        }));
      }
    } catch {
      reload();
    }
  };

  const handleAddEntries = async (entries) => {
    try {
      const { entries: fullList } = await apiPost('/saved-entries/bulk', {
        projectId: selectedProjectId,
        entries,
      });
      setResult((prev) => ({
        ...prev,
        entries: Array.isArray(fullList) ? fullList : prev.entries,
      }));
    } catch {
      reload();
    }
  };

  const handleUpdateEntry = async (entryId, updates) => {
    setResult((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === entryId ? { ...e, ...updates } : e,
      ),
    }));

    try {
      const updated = await apiPatch(`/saved-entries/${encodeURIComponent(entryId)}`, {
        projectId: selectedProjectId,
        updates,
      });
      setResult((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === entryId ? updated : e)),
      }));
    } catch {
      reload();
    }
  };

  return {
    savedEntries,
    loading,
    error,
    reload,
    handleSaveEntry,
    handleLoadEntry,
    handleDeleteEntry,
    handleExportEntries,
    handleImportEntries,
    handleUpdateEntryTodo,
    handleAddEntries,
    handleUpdateEntry,
  };
}

export default useSavedEntries;
