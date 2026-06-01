import FormField from '../ui/FormField';

export default function AdvancedDescriptionFields({
  formData,
  setFormData,
}) {
  return (
    <>
      <div className="form-group">
        {/* CUSTOM STORY BLOCK */}
        <FormField label="Custom Story Block">
          <textarea
            id="customStory"
            className="form-textarea"
            value={formData.customStory}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customStory: e.target.value,
              }))
            }
            rows={5}
            placeholder="Write a custom story paragraph for the long description..."
          />
        </FormField>
      </div>

      {/* CUSTOM LOG NOTE */}
      <div className="form-group">
        <FormField label="Custom Log Note">
          <textarea
            id="customLogNote"
            className="form-textarea"
            value={formData.customLogNote}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customLogNote: e.target.value,
              }))
            }
            rows={4}
            placeholder="Write a custom operator/log note..."
          />
        </FormField>

        {/* ADDITIONAL HASHTAGS */}
        <FormField label="Additional Hashtags">
          <input
            type="text"
            className="form-input"
            value={formData.customHashtags || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customHashtags: e.target.value,
              }))
            }
            placeholder="tag1, tag2, tag3"
          />
        </FormField>

        {/* CUSTOM CTA */}
        <FormField label="Custom Cta">
          <textarea
            id="customCta"
            className="form-textarea"
            value={formData.customCta}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customCta: e.target.value,
              }))
            }
            rows={4}
            placeholder="Write a custom CTA for comments..."
          />
        </FormField>

      </div>
    </>
  );
}
