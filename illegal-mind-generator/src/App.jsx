import { useState } from 'react';

import { generateTitles } from './engine/generateTitles';
import { generateThumbnails } from './engine/generateThumbnails';
import { generateDescriptions } from './engine/generateDescriptions';
import { generateHashtags } from './engine/generateHashtags';
import { generateHybridPrompt } from './engine/generateHybridPrompt';

import projects from './config/projects.json';
import InputForm from './components/InputForm';

function App() {
  const [formData, setFormData] = useState({
    project: 'Illegal Mind',
    artist: '',
    song: '',
    signalNumber: '',
    videoType: 'Long',
    changesMade: '',
    extraVibeNote: '',
  });
  const [titles, setTitles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [hashtags, setHashtags] = useState('');
  const [hybridPrompt, setHybridPrompt] = useState('');

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
    <div>
      <h1>Illegal Mind Generator</h1>
      <InputForm
        formData={formData}
        setFormData={setFormData}
        onGenerate={handleGenerate}
      />
      <div>
        <h2>Generated Output</h2>

        {titles.map((title, index) => (
          <div key={index}>
            <p>
              <strong>Title:</strong> {title}
            </p>
            <p>
              <strong>Thumbnail:</strong> {thumbnails[index]}
            </p>
            <hr />
          </div>
        ))}
      </div>
      <div>
        <h2>Descriptions</h2>
        {descriptions.map((description, index) => (
          <div key={index}>
            <p>{description}</p>
            <hr />
          </div>
        ))}
      </div>
      <div>
        <h2>Hashtags</h2>
        <p>{hashtags}</p>
      </div>
      <div>
        <h2>Hybrid Prompt</h2>
        <pre>{hybridPrompt}</pre>
      </div>
    </div>
  );
}

export default App;
