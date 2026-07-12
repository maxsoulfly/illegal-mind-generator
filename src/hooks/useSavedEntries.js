import { useEffect, useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

const buildEntryId = (artist, song) =>
  `${artist}-${song}`.trim().toLowerCase().replace(/\s+/g, ' ');

const normalizeEntryIds = (entries) => {
  const seen = new Set();

  return entries
    .map((entry) => ({
      ...entry,
      id: buildEntryId(entry.artist || '', entry.song || ''),
    }))
    .filter((entry) => {
      if (seen.has(entry.id)) return false;

      seen.add(entry.id);
      return true;
    });
};

const isEmptyValue = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === 'object') return Object.keys(value).length === 0;
  return !value;
};

// Import merges field-by-field: an imported field that's empty/absent never
// overwrites an existing entry's real data. Without this, importing a
// library exported from another device (or an older export) would blindly
// replace a matching local entry wholesale, silently wiping out anything
// the imported copy didn't have (e.g. a Todo status set locally after that
// export was taken).
const preferNonEmpty = (importedValue, existingValue) =>
  isEmptyValue(importedValue) ? (existingValue ?? importedValue) : importedValue;

const mergeImportedEntry = (item, existing) => {
  const importedOverrides = (() => {
    const overrides =
      item.songBlockOverrides && typeof item.songBlockOverrides === 'object'
        ? { ...item.songBlockOverrides }
        : {};
    if (!overrides.storyBlock && String(item.customStory || '').trim()) {
      overrides.storyBlock = String(item.customStory).trim();
    }
    if (!overrides.logBlock && String(item.customLogNote || '').trim()) {
      overrides.logBlock = String(item.customLogNote).trim();
    }
    return overrides;
  })();

  return {
    id: buildEntryId(item.artist, item.song),
    artist: item.artist.trim(),
    song: item.song.trim(),
    signalNumber: preferNonEmpty(
      String(item.signalNumber || '').trim(),
      existing?.signalNumber,
    ),
    originalYear: preferNonEmpty(
      String(item.originalYear || '').trim(),
      existing?.originalYear,
    ),
    originalGenre: preferNonEmpty(
      String(item.originalGenre || '').trim(),
      existing?.originalGenre,
    ),
    useCustomArtistShort:
      item.useCustomArtistShort !== undefined
        ? Boolean(item.useCustomArtistShort)
        : existing?.useCustomArtistShort || false,
    artistShort: preferNonEmpty(
      String(item.artistShort || '').trim(),
      existing?.artistShort,
    ),
    transformationTags: preferNonEmpty(
      Array.isArray(item.transformationTags) ? item.transformationTags : [],
      existing?.transformationTags,
    ),
    customHashtags: preferNonEmpty(
      String(item.customHashtags || '').trim(),
      existing?.customHashtags,
    ),
    customCta: preferNonEmpty(
      String(item.customCta || '').trim(),
      existing?.customCta,
    ),
    // Shallow-merged, not swapped: an import that only touches one block
    // (e.g. storyBlock) shouldn't erase an existing override on another
    // block (e.g. logBlock) that the import simply doesn't mention.
    songBlockOverrides: {
      ...(existing?.songBlockOverrides || {}),
      ...importedOverrides,
    },
    excludeFromRandomizer:
      item.excludeFromRandomizer !== undefined
        ? Boolean(item.excludeFromRandomizer)
        : existing?.excludeFromRandomizer || false,
    todo: {
      status: preferNonEmpty(
        String(item.todo?.status || '').trim(),
        existing?.todo?.status,
      ),
      notes: preferNonEmpty(
        String(item.todo?.notes || '').trim(),
        existing?.todo?.notes,
      ),
    },
  };
};

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-');

function useSavedEntries(
  formData,
  setFormData,
  selectedProjectId,
  projectName,
) {
  const [savedEntriesByProject, setSavedEntriesByProject] = useState(() => {
    const unified = loadAppStorage().savedEntries;

    if (unified && Object.keys(unified).length > 0) {
      return Object.fromEntries(
        Object.entries(unified).map(([projectId, entries]) => [
          projectId,
          normalizeEntryIds(entries),
        ]),
      );
    }

    const saved = localStorage.getItem('savedEntries');
    if (!saved) return {};

    const parsed = JSON.parse(saved);

    const normalized = Array.isArray(parsed)
      ? { illegalMindCovers: normalizeEntryIds(parsed) }
      : Object.fromEntries(
          Object.entries(parsed).map(([projectId, entries]) => [
            projectId,
            normalizeEntryIds(entries),
          ]),
        );

    updateAppStorage((storage) => ({ ...storage, savedEntries: normalized }));

    return normalized;
  });

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
    const entry = {
      id: buildEntryId(formData.artist, formData.song),
      artist: formData.artist.trim(),
      song: formData.song.trim(),
      signalNumber: formData.signalNumber.trim(),
      originalYear: formData.originalYear?.trim() || '',
      originalGenre: formData.originalGenre?.trim() || '',
      useCustomArtistShort: formData.useCustomArtistShort || false,
      artistShort: formData.artistShort?.trim() || '',

      transformationTags: formData.transformationTags || [],
      customHashtags: formData.customHashtags?.trim() || '',
      customCta: formData.customCta,
      songBlockOverrides: formData.songBlockOverrides || {},
      excludeFromRandomizer: formData.excludeFromRandomizer || false,
      todo: {
        status: formData.todo?.status || '',
        notes: formData.todo?.notes?.trim() || '',
      },
    };

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
    const songBlockOverrides = { ...(entry.songBlockOverrides || {}) };

    // Legacy fields that predate songBlockOverrides — seed them forward once
    // so the generic override fields show old data and future saves migrate
    // naturally, without touching stored entries directly.
    if (!songBlockOverrides.customCtaBlock && entry.customCta?.trim()) {
      songBlockOverrides.customCtaBlock = entry.customCta.trim();
    }
    if (!songBlockOverrides.storyBlock && entry.customStory?.trim()) {
      songBlockOverrides.storyBlock = entry.customStory.trim();
    }
    if (!songBlockOverrides.logBlock && entry.customLogNote?.trim()) {
      songBlockOverrides.logBlock = entry.customLogNote.trim();
    }

    setFormData((prev) => ({
      ...prev,
      artist: entry.artist || '',
      song: entry.song || '',
      signalNumber: entry.signalNumber || '',
      originalYear: entry.originalYear || '',
      originalGenre: entry.originalGenre || '',
      useCustomArtistShort: entry.useCustomArtistShort || false,
      artistShort: entry.artistShort || '',
      transformationTags: entry.transformationTags || [],
      customHashtags: entry.customHashtags?.trim() || '',
      customCta: entry.customCta || '',
      customLogNote: entry.customLogNote || '',
      songBlockOverrides,

      excludeFromRandomizer: entry.excludeFromRandomizer || false,
      todo: {
        status: entry.todo?.status || '',
        notes: entry.todo?.notes || '',
      },
    }));
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
