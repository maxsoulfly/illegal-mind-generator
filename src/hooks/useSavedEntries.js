import { useEffect, useState } from 'react';

function useSavedEntries(formData, setFormData) {
  const [savedEntries, setSavedEntries] = useState(() => {
    const saved = localStorage.getItem('savedEntries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('savedEntries', JSON.stringify(savedEntries));
  }, [savedEntries]);

  // Save entry
  const handleSaveEntry = () => {
    const entry = {
      id: `${formData.artist}-${formData.song}-${formData.signalNumber}`.toLowerCase(),
      artist: formData.artist.trim(),
      song: formData.song.trim(),
      signalNumber: formData.signalNumber.trim(),

      customStory: formData.customStory?.trim() || '',
      customLogNote: formData.customLogNote?.trim() || '',
    };

    if (!entry.artist || !entry.song) return;

    setSavedEntries((prev) => {
      const exists = prev.some((item) => item.id === entry.id);

      if (exists) {
        return prev.map((item) => (item.id === entry.id ? entry : item));
      }

      return [entry, ...prev];
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
    }));
  };

  // Delete entry
  const handleDeleteEntry = (entryId) => {
    setSavedEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  // Export entries
  const handleExportEntries = () => {
    const blob = new Blob([JSON.stringify(savedEntries, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-songs-library.json';
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
          }));

        setSavedEntries(normalized);
      } catch (error) {
        console.error('Failed to import library:', error);
      }
    };

    reader.readAsText(file);

    event.target.value = '';
  };
  return {
    savedEntries,
    setSavedEntries,
    handleSaveEntry,
    handleLoadEntry,
    handleDeleteEntry,
    handleExportEntries,
    handleImportEntries,
  };
}
export default useSavedEntries;
