export default function AdvancedDescriptionFields({ formData, setFormData }) {
  return (
    <>
      {/* CUSTOM STORY BLOCK */}
      <div className="form-group">
        <label className="form-label" htmlFor="customStory">
          Custom Story Block
        </label>
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
      </div>

      {/* CUSTOM LOG NOTE */}
      <div className="form-group">
        <label className="form-label" htmlFor="customLogNote">
          Custom Log Note
        </label>
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

        <label className="form-label">Additional Hashtags</label>

        {/* ADDITIONAL HASHTAGS */}
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
        {/* CUSTOM CTA */}

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
      </div>
    </>
  );
}
