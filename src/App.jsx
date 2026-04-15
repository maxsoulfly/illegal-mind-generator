import { useEffect, useState, useMemo } from 'react';

import projects from './config/projects.json';

import { generateTitles } from './engine/generateTitles';
import { generateThumbnails } from './engine/generateThumbnails';
import { generateDescriptions } from './engine/generateDescriptions';
import { generateHashtags } from './engine/generateHashtags';
import { generateHybridPrompt } from './engine/generateHybridPrompt';

import InputForm from './components/InputForm';
import GeneratedOutput from './components/GeneratedOutput';

const defaultFormData = {
  project: 'Illegal Mind',
  artist: '',
  song: '',
  signalNumber: '',
  videoType: 'Long',
  changesMade: '',
  extraVibeNote: '',
  transformationTags: [],
  useCustomArtistShort: false,
  artistShort: '',
};

function App() {
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('formData');

    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          ...defaultFormData,
        };
  });

  const projectConfig = useMemo(() => {
    return projects[formData.project] || projects.illegalMind;
  }, [formData.project]);

  const titles = useMemo(() => {
    return generateTitles(formData, projectConfig);
  }, [formData, projectConfig]);
  const thumbnails = useMemo(() => {
    return generateThumbnails(formData, projectConfig);
  }, [formData, projectConfig]);
  const descriptions = useMemo(() => {
    return generateDescriptions(formData);
  }, [formData]);
  const hashtags = useMemo(() => {
    return generateHashtags(formData, projectConfig);
  }, [formData, projectConfig]);
  const hybridPrompt = useMemo(() => {
    return generateHybridPrompt(
      formData,
      titles,
      thumbnails,
      descriptions,
      hashtags,
    );
  }, [formData, titles, thumbnails, descriptions, hashtags]);

  const projectOptions = Object.keys(projects);
  const [savedEntries, setSavedEntries] = useState(() => {
    const saved = localStorage.getItem('savedEntries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('savedEntries', JSON.stringify(savedEntries));
  }, [savedEntries]);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  // Clear form
  const handleClearForm = () => {
    setFormData(defaultFormData);
  };

  // Save entry
  const handleSaveEntry = () => {
    const entry = {
      id: `${formData.artist}-${formData.song}-${formData.signalNumber}`.toLowerCase(),
      artist: formData.artist.trim(),
      song: formData.song.trim(),
      signalNumber: formData.signalNumber.trim(),
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
          }));

        setSavedEntries(normalized);
      } catch (error) {
        console.error('Failed to import library:', error);
      }
    };

    reader.readAsText(file);

    event.target.value = '';
  };

  return (
    <div className="app-shell">
      <h1 className="app-title">YouTube Generator</h1>
      <h2>{projectConfig.title}</h2>
      <div className="layout-grid">
        <div className="panel">
          <InputForm
            formData={formData}
            setFormData={setFormData}
            onClear={handleClearForm}
            projectConfig={projectConfig}
            projectOptions={projectOptions}
            onSaveEntry={handleSaveEntry}
            savedEntries={savedEntries}
            onLoadEntry={handleLoadEntry}
            onDeleteEntry={handleDeleteEntry}
            onExportEntries={handleExportEntries}
            onImportEntries={handleImportEntries}
          />
        </div>

        <GeneratedOutput
          titles={titles}
          thumbnails={thumbnails}
          descriptions={descriptions}
          hashtags={hashtags}
          hybridPrompt={hybridPrompt}
        />
      </div>
    </div>
  );
}

export default App;
