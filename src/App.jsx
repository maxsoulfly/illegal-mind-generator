import { useEffect, useState } from 'react';

import projects from './config/projects.json';

import { generateTitles } from './engine/generateTitles';
import { generateThumbnails } from './engine/generateThumbnails';
import { generateDescriptions } from './engine/generateDescriptions';
import { generateHashtags } from './engine/generateHashtags';
import { generateHybridPrompt } from './engine/generateHybridPrompt';

import InputForm from './components/InputForm';
import CopyButton from './components/CopyButton';

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
  const [titles, setTitles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [hashtags, setHashtags] = useState('');
  const [hybridPrompt, setHybridPrompt] = useState('');

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);
  const handleClearForm = () => {
    setFormData(defaultFormData);
  };
  const handleGenerate = () => {
    const projectConfig = projects[formData.project] || projects.illegalMind;

    const generatedTitles = generateTitles(formData, projectConfig);
    const generatedThumbnails = generateThumbnails(formData, projectConfig);
    const generatedDescriptions = generateDescriptions(formData);
    const generatedHashtags = generateHashtags(formData, projectConfig);
    const generatedHybridPrompt = generateHybridPrompt(
      formData,
      generatedTitles,
      generatedThumbnails,
      generatedDescriptions,
      generatedHashtags,
    );

    setTitles(generatedTitles);
    setThumbnails(generatedThumbnails);
    setDescriptions(generatedDescriptions);
    setHashtags(generatedHashtags);

    setHybridPrompt(generatedHybridPrompt);
  };
  return (
    <div className="app-shell">
      <h1 className="app-title">Illegal Mind Generator</h1>

      <div className="layout-grid">
        <div className="panel">
          <InputForm
            formData={formData}
            setFormData={setFormData}
            onGenerate={handleGenerate}
            onClear={handleClearForm}
            projectConfig={projects[formData.project] || projects.illegalMind}
            projectOptions={Object.keys(projects)}
          />
        </div>

        <div className="output-stack">
          <div className="panel">
            <h2 className="panel-title">Generated Output</h2>

            {titles.map((title, index) => {
              const pairText = `Title: ${title}\nThumbnail: ${thumbnails[index]}`;

              return (
                <div key={index} className="output-item terminal-block">
                  <p>
                    <strong>Title:</strong> {title}
                  </p>
                  <p>
                    <strong>Thumbnail:</strong> {thumbnails[index]}
                  </p>
                  <CopyButton text={pairText} />
                </div>
              );
            })}
          </div>

          <div className="panel">
            <h2 className="panel-title">Descriptions</h2>

            {descriptions.map((description, index) => (
              <div key={index} className="output-item terminal-block">
                <p>{description}</p>
                <CopyButton text={description} />
              </div>
            ))}
          </div>

          <div className="panel">
            <h2 className="panel-title">Hashtags</h2>

            <div className="output-item terminal-block">
              <p className="output-text">{hashtags}</p>
              <CopyButton text={hashtags} />
            </div>
          </div>

          <div className="panel">
            <h2 className="panel-title">Hybrid Prompt</h2>

            <div className="output-item terminal-block">
              <pre className="prompt-block">{hybridPrompt}</pre>
              <CopyButton text={hybridPrompt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
