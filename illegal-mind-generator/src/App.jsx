import { useState } from "react";
import InputForm from "./components/InputForm";

function App() {
  const [formData, setFormData] = useState({
    artist: "",
    song: "",
    signalNumber: ""
  });

  const handleGenerate = () => {
    console.log("Generate from App:", formData);
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