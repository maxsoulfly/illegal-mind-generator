import { useEffect, useState, useMemo } from 'react';

import projects from './config/projects.json';

import { generateDescriptions } from './engine/descriptions/generateDescriptions';
import { generateTitles } from './engine/titles/generateTitles';
import { generateThumbnails } from './engine/titles/generateThumbnails';
import { generateHashtags } from './engine/hashtags/generateHashtags';
import { generateShortHooks } from './engine/hooks/generateShortHooks';

import buildResolvedProjectConfig from './utils/buildResolvedProjectConfig';

import useTagOverrides from './hooks/useTagOverrides';
import useSavedEntries from './hooks/useSavedEntries';

import AppMenu from './components/AppMenu';

import TagLibraryPage from './pages/TagLibraryPage';
import GeneratorPage from './pages/GeneratorPage';
import ShortsQueuePage from './pages/ShortsQueuePage';

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
  excludeFromRandomizer: false,
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
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('activePage') || 'generator';
  });

  const [projectId, setProjectId] = useState(() => {
    return localStorage.getItem('selectedProject') || DEFAULT_PROJECT_KEY;
  });
  // effects
  useEffect(() => {
    localStorage.setItem('panelVisibility', JSON.stringify(panelVisibility));
  }, [panelVisibility]);

  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  useEffect(() => {
    localStorage.setItem('selectedProject', projectId);
  }, [projectId]);

  const projectConfig = useMemo(() => {
    return projects[projectId] || projects[defaultFormData.project] || {};
  }, [projectId]);
  const { projectOverrides, updateTagOverride, resetTagOverride } =
    useTagOverrides(projectId);

  const resolvedProjectConfig = useMemo(() => {
    return buildResolvedProjectConfig(projectConfig, projectOverrides);
  }, [projectConfig, projectOverrides]);

  const {
    savedEntries,
    handleSaveEntry,
    handleLoadEntry,
    handleDeleteEntry,
    handleExportEntries,
    handleImportEntries,
  } = useSavedEntries(formData, setFormData, projectId, projectConfig.name);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const handleProjectChange = (nextProjectId) => {
    setProjectId(nextProjectId);

    setFormData((prev) => ({
      ...prev,
      project: nextProjectId,
    }));
  };

  const generatedOutput = useMemo(() => {
    const titles = generateTitles(formData, resolvedProjectConfig);
    const thumbnails = generateThumbnails(formData, resolvedProjectConfig);

    const shortHooks = generateShortHooks(formData, resolvedProjectConfig);

    const { longDescription, shortDescriptions, fileId } = generateDescriptions(
      formData,
      resolvedProjectConfig,
      shortHooks,
    );

    const hashtagOutput = generateHashtags(formData, resolvedProjectConfig);

    const hashtags = hashtagOutput.hashtags;
    const youtubeTags = hashtagOutput.youtubeTags;

    return {
      titles,
      thumbnails,
      longDescription,
      shortDescriptions,
      hashtags,
      youtubeTags,
      shortHooks,
      fileId,
    };
  }, [formData, resolvedProjectConfig, generationSeed]);

  // const projectOptions = Object.keys(projects);

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
      <AppMenu
        activePage={activePage}
        setActivePage={setActivePage}
        projectId={projectId}
        setProjectId={handleProjectChange}
        projects={projects}
      />
      {activePage === 'generator' && (
        <GeneratorPage
          projectId={projectId}
          formData={formData}
          setFormData={setFormData}
          projectConfig={resolvedProjectConfig}
          generatedOutput={generatedOutput}
          savedEntries={savedEntries}
          handleSaveEntry={handleSaveEntry}
          handleClearForm={handleClearForm}
          handleLoadEntry={handleLoadEntry}
          handleDeleteEntry={handleDeleteEntry}
          handleExportEntries={handleExportEntries}
          handleImportEntries={handleImportEntries}
          panelVisibility={panelVisibility}
          setPanelVisibility={setPanelVisibility}
          togglePanel={togglePanel}
          tagUsage={tagUsage}
          handleRegenerate={handleRegenerate}
          projectOverrides={projectOverrides}
        />
      )}
      {activePage === 'tags' && (
        <TagLibraryPage
          projectId={projectId}
          projectConfig={resolvedProjectConfig}
          savedEntries={savedEntries}
          projectName={projectConfig.name}
          projectOverrides={projectOverrides}
          updateTagOverride={updateTagOverride}
          resetTagOverride={resetTagOverride}
          onLoadEntry={(entry) => {
            handleLoadEntry(entry);
            setActivePage('generator');
          }}
        />
      )}
      {activePage === 'shortsQueue' && (
        <ShortsQueuePage
          key={projectId}
          projectId={projectId}
          savedEntries={savedEntries}
          onLoadEntry={(entry) => {
            handleLoadEntry(entry);
            setActivePage('generator');
          }}
          projectConfig={resolvedProjectConfig}
        />
      )}
    </div>
  );
}

export default App;
