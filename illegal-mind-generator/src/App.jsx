import { useState } from "react";
import projects from "./config/projects.json";
import { generateTitles } from "./engine/generateTitles";
import InputForm from "./components/InputForm";

function App() {
  const [formData, setFormData] = useState({
    project: "Illegal Mind",
    artist: "",
    song: "",
    signalNumber: "",
    videoType: "Long",
    changesMade: "",
    extraVibeNote: ""
  });

 const handleGenerate = () => {
  const projectConfig = projects.illegalMind;

  const titles = generateTitles(formData, projectConfig);

  console.log("Titles:", titles);
};

  return (
    <div>
      <h1>Illegal Mind Generator</h1>
      <InputForm
        formData={formData}
        setFormData={setFormData}
        onGenerate={handleGenerate}
      />
    </div>
  );
}

export default App;