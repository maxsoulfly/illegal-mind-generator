import { useEffect, useState, useMemo } from 'react';

import projects from './config/projects.json';

import { generateTitles } from './engine/generateTitles';
import { generateThumbnails } from './engine/generateThumbnails';
import { generateDescriptions } from './engine/generateDescriptions';
import { generateHashtags } from './engine/generateHashtags';
// import { generateHybridPrompt } from './engine/generateHybridPrompt';

import useSavedEntries from './hooks/useSavedEntries';
import InputForm from './components/InputForm';
import GeneratedOutput from './components/GeneratedOutput';
import SavedLibrary from './components/SavedLibrary';

const DEFAULT_PROJECT_KEY = Object.keys(projects)[0];
const ADVANCED_OPTIONS_KEY = 'advancedOptionsOpen';

const defaultFormData = {
  project: DEFAULT_PROJECT_KEY,
  artist: '',
  song: '',
  signalNumber: '',
  videoType: 'Long',
  changesMade: '',
  extraVibeNote: '',
  transformationTags: [],
  useCustomArtistShort: false,
  artistShort: '',

  customStory: '',
  customLogNote: '',
  customHashtags: '',
  customCta: '',
};

function App() {
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('formData');

    return savedFormData
      ? {
          ...defaultFormData,
          ...JSON.parse(savedFormData),
        }
      : {
          ...defaultFormData,
        };
  });

  const [panelVisibility, setPanelVisibility] = useState(() => {
    const saved = localStorage.getItem('panelVisibility');
    return saved
      ? JSON.parse(saved)
      : {
          titles: true,
          descriptions: true,
          hashtags: true,
          hybridPrompt: true,
        };
  });

  useEffect(() => {
    localStorage.setItem('panelVisibility', JSON.stringify(panelVisibility));
  }, [panelVisibility]);

  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(() => {
    return localStorage.getItem(ADVANCED_OPTIONS_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(ADVANCED_OPTIONS_KEY, advancedOptionsOpen);
  }, [advancedOptionsOpen]);

  const [generationSeed, setGenerationSeed] = useState(0);

  const {
    savedEntries,
    handleSaveEntry,
    handleLoadEntry,
    handleDeleteEntry,
    handleExportEntries,
    handleImportEntries,
  } = useSavedEntries(formData, setFormData);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const projectConfig = useMemo(() => {
    return (
      projects[formData.project] || projects[defaultFormData.project] || {}
    );
  }, [formData.project]);

  const generatedOutput = useMemo(() => {
    const titles = generateTitles(formData, projectConfig);
    const thumbnails = generateThumbnails(formData, projectConfig);
    const { longDescription, shortDescriptions, fileId } = generateDescriptions(
      formData,
      projectConfig,
    );
    const hashtagOutput = generateHashtags(formData, projectConfig);

    const hashtags = hashtagOutput.hashtags;
    const youtubeTags = hashtagOutput.youtubeTags;

    // const descriptionOutput = shortDescriptions.map((shortDescription) => ({
    //   shortDescription,
    //   longDescription,
    // }));

    // const hybridPrompt = generateHybridPrompt(
    //   longDescription,
    //   hashtags,
    //   fileId,
    // );

    return {
      titles,
      thumbnails,
      longDescription,
      shortDescriptions,
      hashtags,
      youtubeTags,
      // hybridPrompt,
      fileId,
    };
  }, [formData, projectConfig, generationSeed]);

  const projectOptions = Object.keys(projects);

  // Clear form
  const handleClearForm = () => {
    setFormData({ ...defaultFormData });
  };

  const handleRegenerate = () => {
    setGenerationSeed((prev) => prev + 1);
  };

  const tagUsage = useMemo(() => {
    return savedEntries.reduce((acc, entry) => {
      (entry.transformationTags || []).forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });

      return acc;
    }, {});
  }, [savedEntries]);

  return (
    <div className="app-shell">
      <h1 className="app-title">YouTube Generator</h1>
      <div className="regenerate-row">
        <button
          type="button"
          className="button-primary"
          onClick={handleRegenerate}
        >
          Regenerate
        </button>
      </div>
      <h2>{projectConfig.name}</h2>
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
            tagUsage={tagUsage}
            advancedOptionsOpen={advancedOptionsOpen}
            setAdvancedOptionsOpen={setAdvancedOptionsOpen}
          />
        </div>

        <div className="panel">
          <SavedLibrary
            savedEntries={savedEntries}
            onLoadEntry={handleLoadEntry}
            onDeleteEntry={handleDeleteEntry}
            onExportEntries={handleExportEntries}
            onImportEntries={handleImportEntries}
          />
          <GeneratedOutput
            titles={generatedOutput.titles}
            thumbnails={generatedOutput.thumbnails}
            descriptions={generatedOutput.shortDescriptions}
            hashtags={generatedOutput.hashtags}
            youtubeTags={generatedOutput.youtubeTags}
            hybridPrompt={generatedOutput.hybridPrompt}
            videoType={formData.videoType}
            longDescription={generatedOutput.longDescription}
            panelVisibility={panelVisibility}
            setPanelVisibility={setPanelVisibility}
            fileId={generatedOutput.fileId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
