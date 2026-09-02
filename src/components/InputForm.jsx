import useInputFormLogic from '../hooks/useInputFormLogic';

import BasicSongFields from './input/BasicSongFields';
import TransformationTagSelector from './input/TransformationTagSelector';
import AdvancedDescriptionFields from './input/AdvancedDescriptionFields';
import CoverShortHooksEditor from './input/CoverShortHooksEditor';
import InputFormActions from './input/InputFormActions';
import ToggleButton from './ui/ToggleButton';
import FormField from './ui/FormField';
import EntrySettings from './entry/EntrySettings';

import TodoFields from './todo/TodoFields';

function InputForm({
  projectId,
  projects,
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
  songOverrideTarget,
  clearSongOverrideTarget,
  coverHookTarget,
  clearCoverHookTarget,
  onOpenSourceTag,
  onAddToCalendar,
  canAddToCalendar,
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
      <div className="panel-header">
        <h2>Input</h2>
        <ToggleButton
          isOpen={panelVisibility.input}
          onClick={() => togglePanel('input')}
          label="Input"
          compact
        />
      </div>

      {panelVisibility.input ? (
        <>
          <BasicSongFields
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            artistSuggestions={artistSuggestions}
            songSuggestions={songSuggestions}
            songOverrideTarget={songOverrideTarget}
            clearSongOverrideTarget={clearSongOverrideTarget}
          />

          <EntrySettings
            entry={formData}
            onUpdateEntry={(_, updates) =>
              setFormData((prev) => ({
                ...prev,
                ...updates,
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
                  onOpenSourceTag={onOpenSourceTag}
                />

                <AdvancedDescriptionFields
                  formData={formData}
                  setFormData={setFormData}
                  projectConfig={projectConfig}
                  songOverrideTarget={songOverrideTarget}
                  clearSongOverrideTarget={clearSongOverrideTarget}
                />
              </div>
            </div>
          )}

          <div className="cover-hooks-section">
            <ToggleButton
              isOpen={panelVisibility.coverHooks}
              onClick={() => togglePanel('coverHooks')}
              label={`Cover-Specific Hooks (${(formData.coverShortHooks || []).length})`}
            />
            {panelVisibility.coverHooks && (
              <div className="advanced-panel-content">
                <CoverShortHooksEditor
                  formData={formData}
                  setFormData={setFormData}
                  projectConfig={projectConfig}
                  coverHookTarget={coverHookTarget}
                  clearCoverHookTarget={clearCoverHookTarget}
                />
              </div>
            )}
          </div>

          <InputFormActions
            key={projectId}
            onSaveEntry={onSaveEntry}
            onClear={onClear}
            projectId={projectId}
            projects={projects}
            onAddToCalendar={onAddToCalendar}
            canAddToCalendar={canAddToCalendar}
          />
        </>
      ) : (
        <div className="input-collapsed-summary text-main">
          <strong>{formData.artist || 'Untitled Artist'}</strong> —{' '}
          {formData.song || 'Untitled Song'}
        </div>
      )}
    </div>
  );
}

export default InputForm;
