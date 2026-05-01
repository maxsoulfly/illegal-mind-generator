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
import AppMenu from './components/AppMenu';
import TagLibraryPage from './pages/TagLibraryPage';

const DEFAULT_PROJECT_KEY = Object.keys(projects)[0];

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
  // states
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
          advanced: false,
        };
  });
  const [generationSeed, setGenerationSeed] = useState(0);
  const [activePage, setActivePage] = useState('generator');

  // effects
  useEffect(() => {
    localStorage.setItem('panelVisibility', JSON.stringify(panelVisibility));
  }, [panelVisibility]);

  const projectConfig = useMemo(() => {
    return (
      projects[formData.project] || projects[defaultFormData.project] || {}
    );
  }, [formData.project]);

  const {
    savedEntries,
    handleSaveEntry,
    handleLoadEntry,
    handleDeleteEntry,
    handleExportEntries,
    handleImportEntries,
  } = useSavedEntries(
    formData,
    setFormData,
    formData.project,
    projectConfig.name,
  );

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

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

  const togglePanel = (panelKey) => {
    setPanelVisibility((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };

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
      <AppMenu activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'generator' && (
        <>
          <div className="panel-header">
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
                panelVisibility={panelVisibility}
                togglePanel={togglePanel}
              />
            </div>

            <div className="panel">
              <SavedLibrary
                savedEntries={savedEntries}
                onLoadEntry={handleLoadEntry}
                onDeleteEntry={handleDeleteEntry}
                onExportEntries={handleExportEntries}
                onImportEntries={handleImportEntries}
                projectConfig={projectConfig}
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
                projectConfig={projectConfig}
              />
            </div>
          </div>
        </>
      )}
      {activePage === 'tags' && (
        <TagLibraryPage
          projectConfig={projectConfig}
          savedEntries={savedEntries}
          projectName={projectConfig.name}
        />
      )}
    </div>
  );
}

export default App;
