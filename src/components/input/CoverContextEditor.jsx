import FormField from '../ui/FormField';
import CopyPromptButton from '../ui/CopyPromptButton';
import { buildCoverInterviewPrompt } from '../../utils/coverInterviewPrompt';

// Editor for formData.coverContext — a free-text, real/factual backstory for
// the loaded cover (reasons, memories, recording/arrangement decisions).
// Purely a reference field: it never enters generation and is never shown in
// any generated output. Feeds the Interview prompt and the revised
// Cover-Specific Short Hooks prompt as context only.
//
// Controlled textarea: onChange keeps formData.coverContext live on every
// keystroke (so an immediate Copy Prompt / Save click always reads the
// latest text, even before blur); onBlur is the DB write, matching this
// app's onBlur-saves convention — see GeneratorPage.jsx's persistCoverContext
// (mirrors persistCoverHooks: a no-op for an unsaved song, rides the next
// explicit SAVE).
export default function CoverContextEditor({
  formData,
  setFormData,
  projectConfig,
  onPersistCoverContext,
}) {
  const canCopyPrompt = !!((formData.artist || '').trim() && (formData.song || '').trim());

  const handleChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, coverContext: value }));
  };

  const handleBlur = () => {
    onPersistCoverContext?.(formData.coverContext);
  };

  return (
    <FormField label="Cover Context">
      <p className="tag-card-subtitle">
        The real story behind this cover — not automatically shown in any
        generated title, description, or hook.
      </p>
      <textarea
        className="form-input"
        rows={6}
        value={formData.coverContext || ''}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <div className="button-row">
        <CopyPromptButton
          getPrompt={() => buildCoverInterviewPrompt(formData, projectConfig)}
          label="Copy Interview Prompt"
          disabled={!canCopyPrompt}
          disabledTooltip="Enter an artist and song first"
        />
      </div>
    </FormField>
  );
}
