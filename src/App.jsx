import { useEffect, useState } from 'react';

import projects from './config/projects.json';

import { generateTitles } from './engine/generateTitles';
import { generateThumbnails } from './engine/generateThumbnails';
import { generateDescriptions } from './engine/generateDescriptions';
import { generateHashtags } from './engine/generateHashtags';
import { generateHybridPrompt } from './engine/generateHybridPrompt';

import InputForm from './components/InputForm';
import GeneratedOutput from './components/GeneratedOutput';

function App() {
  const defaultFormData = {
    project: 'Illegal Mind',
    artist: '',
    song: '',
    signalNumber: '',
    videoType: 'Long',
    changesMade: '',
    extraVibeNote: '',
    transformationTags: [],
  };

  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('formData');

    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          project: 'Illegal Mind',
          artist: '',
          song: '',
          signalNumber: '',
          videoType: 'Long',
          changesMade: '',
          extraVibeNote: '',
          transformationTags: [],
        };
  });

  const projectConfig = projects[formData.project] || projects.illegalMind;

  const titles = generateTitles(formData, projectConfig);
  const thumbnails = generateThumbnails(formData, projectConfig);
  const descriptions = generateDescriptions(formData);
  const hashtags = generateHashtags(formData, projectConfig);
  const hybridPrompt = generateHybridPrompt(
    formData,
    titles,
    thumbnails,
    descriptions,
    hashtags,
  );

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const handleClearForm = () => {
    setFormData(defaultFormData);
  };

  return (
    <div className="app-shell">
      <h1 className="app-title">YouTube Generator</h1>

      <div className="layout-grid">
        <div className="panel">
          <InputForm
            formData={formData}
            setFormData={setFormData}
            onClear={handleClearForm}
            projectConfig={projectConfig}
            projectOptions={Object.keys(projects)}
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
