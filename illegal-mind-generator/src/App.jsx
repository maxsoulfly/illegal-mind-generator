import { useState } from 'react';
import projects from './config/projects.json';
import { generateTitles } from './engine/generateTitles';
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

  const handleGenerate = () => {
    const projectConfig = projects.illegalMind;
    const generatedTitles = generateTitles(formData, projectConfig);
    setTitles(generatedTitles);
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
    </div>
  );
}

export default App;
