import useInputFormLogic from '../hooks/useInputFormLogic';

import BasicSongFields from './input/BasicSongFields';
import TransformationTagSelector from './input/TransformationTagSelector';
import AdvancedDescriptionFields from './input/AdvancedDescriptionFields';
import InputFormActions from './input/InputFormActions';
import ToggleButton from './ui/ToggleButton';
import FormField from './ui/FormField';
import QueueSettings from './input/QueueSettings';

import TodoFields from './todo/TodoFields';

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
  projectOverrides,
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
    projectOverrides,
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
      <QueueSettings
        excludeFromRandomizer={formData.excludeFromRandomizer}
        onToggle={(value) =>
          setFormData((prev) => ({
            ...prev,
            excludeFromRandomizer: value,
          }))
        }
      />

      <TodoFields
        todo={formData.todo}
        statuses={projectConfig.todoStatuses || []}
        onChange={(todo) =>
          setFormData((prev) => ({
            ...prev,
            todo,
          }))
        }
      />

      <ToggleButton
        isOpen={panelVisibility.advanced}
        onClick={() => togglePanel('advanced')}
        label="Advanced Options"
      />
      {panelVisibility.advanced && (
        <div className="advanced-panel-content">
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
