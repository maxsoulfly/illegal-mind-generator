import TemplateGroupCard from '../ui/TemplateGroupCard';
import FormSelect from '../ui/FormSelect';
import IconButton from '../ui/IconButton';

const WEEKDAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const VIDEO_TYPE_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
];

// uploadSchedule is a single flat top-level projects.json key, always
// rewritten as a whole { slots: [...] } object on every edit (matching
// todoStatuses' whole-array-replace discipline, not shortsQueue's
// independently-patchable-fields shape) — so no dedicated nested-merge
// block is needed in buildResolvedProjectConfig.js.
export default function ProjectSettingsUploadSchedule({
  projectConfig,
  updateProjectOverride,
  resetProjectOverride,
}) {
  const slots = projectConfig.uploadSchedule?.slots || [];

  function setSlots(next) {
    updateProjectOverride({ uploadSchedule: { slots: next } });
  }

  function updateSlot(index, patch) {
    const next = slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot));
    setSlots(next);
  }

  function removeSlot(index) {
    setSlots(slots.filter((_, i) => i !== index));
  }

  function addSlot() {
    setSlots([...slots, { weekday: 0, videoType: 'short', time: '18:00' }]);
  }

  return (
    <section>
      <h2 className="panel-title">Upload Schedule</h2>

      <div className="tag-library tag-library--half">
        <TemplateGroupCard
          label="Weekly Slots"
          subtitle="The days and times you usually upload. Drives the Calendar page's 'usual upload day' markers and where a song lands when auto-added to the next open slot."
          onReset={() => resetProjectOverride('uploadSchedule')}
        >
          <span className="tag-status">{slots.length} slot{slots.length === 1 ? '' : 's'}</span>

          <div className="links-registry upload-schedule-list">
            {slots.map((slot, index) => (
              <div key={index} className="upload-schedule-row">
                <input
                  type="text"
                  className="form-input upload-schedule-title"
                  placeholder="e.g. Covers, Vlog, Behind the Scenes"
                  value={slot.title || ''}
                  onChange={(e) => updateSlot(index, { title: e.target.value })}
                />
                <FormSelect
                  value={String(slot.weekday)}
                  onChange={(v) => updateSlot(index, { weekday: Number(v) })}
                  options={WEEKDAY_OPTIONS}
                />
                <FormSelect
                  value={slot.videoType}
                  onChange={(v) => updateSlot(index, { videoType: v })}
                  options={VIDEO_TYPE_OPTIONS}
                />
                <input
                  type="time"
                  className="form-input"
                  value={slot.time || '18:00'}
                  onChange={(e) => updateSlot(index, { time: e.target.value })}
                />
                <IconButton icon="×" title="Remove slot" onClick={() => removeSlot(index)} />
              </div>
            ))}

            <div className="upload-schedule-row upload-schedule-row--add">
              <button type="button" className="button-secondary" onClick={addSlot}>
                + Add Slot
              </button>
            </div>
          </div>
        </TemplateGroupCard>
      </div>
    </section>
  );
}
