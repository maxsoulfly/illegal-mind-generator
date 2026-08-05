import { useState } from 'react';

import { useUploadCalendar } from '../hooks/useUploadCalendar';
import { useShortsQueue } from '../hooks/useShortsQueue';
import { addMonths } from '../utils/calendarDates';

import CalendarMonthNav from '../components/calendar/CalendarMonthNav';
import CalendarMonthGrid from '../components/calendar/CalendarMonthGrid';
import CalendarEntryPicker from '../components/calendar/CalendarEntryPicker';
import CalendarImportPanel from '../components/calendar/CalendarImportPanel';
import Modal from '../components/ui/Modal';

export default function CalendarPage({
  projectId,
  savedEntries,
  onLoadEntry,
  projectConfig,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [pickerTarget, setPickerTarget] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const calendar = useUploadCalendar(projectId, savedEntries, projectConfig.uploadSchedule);
  const monthGrid = calendar.getMonthGrid(year, month);

  // Shorts slots pick exclusively from the current Shorts Queue, not a full
  // library search — dedupe by id since the same song can appear more than
  // once in a queue (duplicate-spacing only prevents near-neighbors).
  const { queue: shortsQueue } = useShortsQueue(projectId, savedEntries, projectConfig.shortsQueue);
  const shortsQueueEntries = Array.from(
    new Map(shortsQueue.filter(Boolean).map((entry) => [entry.id, entry])).values(),
  );

  function goToMonth(delta) {
    const next = addMonths(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  return (
    <section className="page-panel">
      <div className="regenerate-row">
        <button type="button" className="button-secondary" onClick={() => setShowImportModal(true)}>
          Import from YouTube
        </button>
      </div>
      <CalendarMonthNav
        year={year}
        month={month}
        onPrev={() => goToMonth(-1)}
        onNext={() => goToMonth(1)}
      />

      <CalendarMonthGrid
        days={monthGrid}
        onLoadEntry={onLoadEntry}
        onSlotClick={(isoDate, videoType, mode) => setPickerTarget({ isoDate, videoType, mode })}
        calendar={calendar}
      />
      {pickerTarget && (
        <CalendarEntryPicker
          target={pickerTarget}
          savedEntries={savedEntries}
          shortsQueueEntries={shortsQueueEntries}
          calendar={calendar}
          onClose={() => setPickerTarget(null)}
        />
      )}
      {showImportModal && (
        <Modal title="Import from YouTube" onClose={() => setShowImportModal(false)}>
          <CalendarImportPanel savedEntries={savedEntries} calendar={calendar} />
        </Modal>
      )}
    </section>
  );
}
