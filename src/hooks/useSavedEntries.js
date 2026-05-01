import { useEffect, useState } from 'react';

const buildEntryId = (artist, song, signalNumber) =>
  `${artist}-${song}-${signalNumber}`.trim().toLowerCase().replace(/\s+/g, ' ');

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
    const saved = localStorage.getItem('savedEntries');
    if (!saved) return {};

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      return {
        illegalMindCovers: parsed,
      };
    }

    return parsed;
  });

  const savedEntries = savedEntriesByProject[selectedProjectId] || [];

  useEffect(() => {
    localStorage.setItem('savedEntries', JSON.stringify(savedEntriesByProject));
  }, [savedEntriesByProject]);

  // Save entry
  const handleSaveEntry = () => {
    const entry = {
      id: buildEntryId(formData.artist, formData.song, formData.signalNumber),
      artist: formData.artist.trim(),
      song: formData.song.trim(),
      signalNumber: formData.signalNumber.trim(),

      customStory: formData.customStory?.trim() || '',
      customLogNote: formData.customLogNote?.trim() || '',
      transformationTags: formData.transformationTags || [],
      customHashtags: formData.customHashtags?.trim() || '',
      customCta: formData.customCta,
    };

    if (!entry.artist || !entry.song) return;

    setSavedEntriesByProject((prev) => {
      const currentProjectEntries = prev[selectedProjectId] || [];

      return {
        ...prev,
        [selectedProjectId]: [
          entry,
          ...currentProjectEntries.filter((item) => item.id !== entry.id),
        ],
      };
    });
  };

  // Load entry
  const handleLoadEntry = (entry) => {
    setFormData((prev) => ({
      ...prev,
      artist: entry.artist || '',
      song: entry.song || '',
      signalNumber: entry.signalNumber || '',
      customStory: entry.customStory || '',
      customLogNote: entry.customLogNote || '',
      transformationTags: entry.transformationTags || [],
      customHashtags: entry.customHashtags?.trim() || '',
      customCta: entry.customCta || '',
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

        const normalized = parsed
          .filter(
            (item) =>
              item &&
              typeof item.artist === 'string' &&
              typeof item.song === 'string',
          )
          .map((item) => ({
            id:
              item.id ||
              `${item.artist}-${item.song}-${item.signalNumber || ''}`.toLowerCase(),
            artist: item.artist.trim(),
            song: item.song.trim(),
            signalNumber: String(item.signalNumber || '').trim(),
            customStory: String(item.customStory || '').trim(),
            customLogNote: String(item.customLogNote || '').trim(),
            transformationTags: Array.isArray(item.transformationTags)
              ? item.transformationTags
              : [],
            customHashtags: String(item.customHashtags || '').trim(),
            customCta: String(item.customCta || '').trim(),
          }));

        setSavedEntriesByProject((prev) => {
          const currentProjectEntries = prev[selectedProjectId] || [];

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
  return {
    savedEntries,
    handleSaveEntry,
    handleLoadEntry,
    handleDeleteEntry,
    handleExportEntries,
    handleImportEntries,
  };
}
export default useSavedEntries;
