import { useState } from 'react';
import { generateTitles } from './engine/generateTitles';
import { generateThumbnails } from "./engine/generateThumbnails";
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

  const handleGenerate = () => {
  const projectConfig = projects.illegalMind;

  const generatedTitles = generateTitles(formData, projectConfig);
  const generatedThumbnails = generateThumbnails(projectConfig);

  setTitles(generatedTitles);
  setThumbnails(generatedThumbnails);
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
        <h2>Titles</h2>
        {titles.map((title, index) => (
          <div key={index}>{title}</div>
        ))}
      </div>
      <div>
  <h2>Thumbnails</h2>
  {thumbnails.map((t, index) => (
    <div key={index}>{t}</div>
  ))}
</div>
    </div>
  );
}

export default App;
