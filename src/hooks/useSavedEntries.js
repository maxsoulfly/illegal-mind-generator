import { useEffect, useState } from 'react';

import { updateAppStorage } from '../utils/storage';
import {
  buildEntryId,
  normalizeEntryIds,
  mergeImportedEntry,
  toSlug,
  buildEntryFromFormData,
  buildFormDataPatchFromEntry,
  loadInitialSavedEntriesByProject,
} from '../utils/savedEntries';

function useSavedEntries(
  formData,
  setFormData,
  selectedProjectId,
  projectName,
) {
  const [savedEntriesByProject, setSavedEntriesByProject] = useState(loadInitialSavedEntriesByProject);

  const savedEntries = savedEntriesByProject[selectedProjectId] || [];

  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      savedEntries: savedEntriesByProject,
    }));
  }, [savedEntriesByProject]);

  // Save entry — targetProjectId lets the Generator save into a project other
  // than the one currently being viewed/edited (defaults to the active one).
  const handleSaveEntry = (targetProjectId = selectedProjectId) => {
    const entry = buildEntryFromFormData(formData);
    if (!entry.artist || !entry.song) return;

    setSavedEntriesByProject((prev) => {
      const currentProjectEntries = prev[targetProjectId] || [];

      return {
        ...prev,
        [targetProjectId]: [
          entry,
          ...currentProjectEntries.filter((item) => item.id !== entry.id),
        ],
      };
    });
  };

  // Load entry
  const handleLoadEntry = (entry) => {
    setFormData((prev) => buildFormDataPatchFromEntry(entry, prev));
  };

  // Delete entry
  const handleDeleteEntry = (entryId) => {
    setSavedEntriesByProject((prev) => {
      const currentProjectEntries = prev[selectedProjectId] || [];

      return {
        ...prev,
        [selectedProjectId]: currentProjectEntries.filter(
          (entry) => entry.id !== entryId,
        ),
      };
    });
  };

  // Export entries
  const handleExportEntries = () => {
    const blob = new Blob([JSON.stringify(savedEntries, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const fileName = `${toSlug(projectName)}-library.json`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import entries
  const handleImportEntries = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        if (!Array.isArray(parsed)) return;

        const validItems = parsed.filter(
          (item) =>
            item &&
            typeof item.artist === 'string' &&
            typeof item.song === 'string',
        );

        setSavedEntriesByProject((prev) => {
          const currentProjectEntries = prev[selectedProjectId] || [];
          const existingById = new Map(
            currentProjectEntries.map((entry) => [entry.id, entry]),
          );

          const normalized = validItems.map((item) =>
            mergeImportedEntry(
              item,
              existingById.get(buildEntryId(item.artist, item.song)),
            ),
          );

          return {
            ...prev,
            [selectedProjectId]: [
              ...normalized,
              ...currentProjectEntries.filter(
                (entry) =>
                  !normalized.some(
                    (importedEntry) => importedEntry.id === entry.id,
                  ),
              ),
            ],
          };
        });
      } catch (error) {
        console.error('Failed to import library:', error);
      }
    };

    reader.readAsText(file);

    event.target.value = '';
  };

  const handleUpdateEntryTodo = (entryId, todo) => {
    setSavedEntriesByProject((prev) => {
      const currentProjectEntries = prev[selectedProjectId] || [];

      return {
        ...prev,
        [selectedProjectId]: currentProjectEntries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                todo: {
                  status: todo.status || '',
                  notes: todo.notes || '',
                },
              }
            : entry,
        ),
      };
    });
  };

  const handleAddEntries = (entries) => {
    setSavedEntriesByProject((prev) => {
      const currentProjectEntries = prev[selectedProjectId] || [];
      const normalizedEntries = normalizeEntryIds(entries);

      return {
        ...prev,
        [selectedProjectId]: [
          ...normalizedEntries,
          ...currentProjectEntries.filter(
            (entry) =>
              !normalizedEntries.some((newEntry) => newEntry.id === entry.id),
          ),
        ],
      };
    });
  };
  const handleUpdateEntry = (entryId, updates) => {
    setSavedEntriesByProject((prev) => {
      const currentProjectEntries = prev[selectedProjectId] || [];

      return {
        ...prev,
        [selectedProjectId]: currentProjectEntries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                ...updates,
              }
            : entry,
        ),
      };
    });
  };
  return {
    savedEntries,
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
