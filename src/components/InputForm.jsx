import useInputFormLogic from '../hooks/useInputFormLogic';

import BasicSongFields from './input/BasicSongFields';
import TransformationTagSelector from './input/TransformationTagSelector';
import AdvancedDescriptionFields from './input/AdvancedDescriptionFields';
import InputFormActions from './input/InputFormActions';
import ToggleButton from './ToggleButton';

function InputForm({
  projectId,
  formData,
  setFormData,
  onClear,
  projectConfig,
  onSaveEntry,
  savedEntries,
  tagUsage = {},
  panelVisibility,
  togglePanel,
}) {
  const {
    visibleTags,
    artistSuggestions,
    songSuggestions,
    handleChange,
    handleTagToggle,
  } = useInputFormLogic({
    projectId,
    formData,
    setFormData,
    projectConfig,
    savedEntries,
  });

  return (
    <div>
      <h2>Input</h2>
      <BasicSongFields
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        artistSuggestions={artistSuggestions}
        songSuggestions={songSuggestions}
      />

      <ToggleButton
        isOpen={panelVisibility.advanced}
        onClick={() => togglePanel('advanced')}
        label="Advanced Options"
      />
      {panelVisibility.advanced && (
        <div className="advanced-options">
          {/* TRANSFORMATION TAGS */}
          <TransformationTagSelector
            visibleTags={visibleTags}
            tagUsage={tagUsage}
            formData={formData}
            onTagToggle={handleTagToggle}
          />

          <AdvancedDescriptionFields
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      )}

      <InputFormActions
        onSaveEntry={onSaveEntry}
        onClear={onClear}
        projectName={projectConfig.name}
      />
    </div>
  );
}

export default InputForm;
