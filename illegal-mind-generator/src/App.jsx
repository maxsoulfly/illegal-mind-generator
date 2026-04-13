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
        };
  });
  const defaultFormData = {
    project: 'Illegal Mind',
    artist: '',
    song: '',
    signalNumber: '',
    videoType: 'Long',
    changesMade: '',
    extraVibeNote: '',
  };
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
    const projectConfig = projects.illegalMind;

    const generatedTitles = generateTitles(formData, projectConfig);
    const generatedThumbnails = generateThumbnails(projectConfig);
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

      <div className="panel">
        <h2 className="panel-title">Input</h2>
        <InputForm
          formData={formData}
          setFormData={setFormData}
          onGenerate={handleGenerate}
          onClear={handleClearForm}
        />
      </div>

      <div className="output-stack">
        <div className="panel">
          <h2 className="panel-title">Generated Output</h2>

          {titles.map((title, index) => {
            const pairText = `Title: ${title}\nThumbnail: ${thumbnails[index]}`;

            return (
              <div key={index}>
                <p>
                  <strong>Title:</strong> {title}
                </p>
                <p>
                  <strong>Thumbnail:</strong> {thumbnails[index]}
                </p>
                <CopyButton text={pairText} />
                <hr />
              </div>
            );
          })}
        </div>

        <div className="panel">
          <h2 className="panel-title">Descriptions</h2>
          {descriptions.map((description, index) => (
            <div key={index}>
              <p>{description}</p>
              <CopyButton text={description} />
              <hr />
            </div>
          ))}
        </div>

        <div className="panel">
          <h2 className="panel-title">Hashtags</h2>
          <p>{hashtags}</p>
          <CopyButton text={hashtags} />
        </div>

        <div className="panel">
          <h2 className="panel-title">Hybrid Prompt</h2>
          <pre>{hybridPrompt}</pre>
          <CopyButton text={hybridPrompt} />
        </div>
      </div>
    </div>
  );
}

export default App;
