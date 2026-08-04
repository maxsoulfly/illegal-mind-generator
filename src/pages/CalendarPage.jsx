import { useState } from 'react';

import { useUploadCalendar } from '../hooks/useUploadCalendar';
import { addMonths } from '../utils/calendarDates';

import CalendarMonthNav from '../components/calendar/CalendarMonthNav';
import CalendarMonthGrid from '../components/calendar/CalendarMonthGrid';

export default function CalendarPage({
  projectId,
  savedEntries,
  onLoadEntry,
  projectConfig,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const calendar = useUploadCalendar(projectId, savedEntries, projectConfig.uploadSchedule);
  const monthGrid = calendar.getMonthGrid(year, month);

  function goToMonth(delta) {
    const next = addMonths(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  return (
    <section className="page-panel">
      <CalendarMonthNav
        year={year}
        month={month}
        onPrev={() => goToMonth(-1)}
        onNext={() => goToMonth(1)}
      />
      <CalendarMonthGrid days={monthGrid} onLoadEntry={onLoadEntry} />
    </section>
  );
}
