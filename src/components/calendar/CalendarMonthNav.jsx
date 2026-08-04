import { formatMonthLabel } from '../../utils/calendarDates';

export default function CalendarMonthNav({ year, month, onPrev, onNext }) {
  return (
    <div className="calendar-month-nav">
      <button type="button" className="button-secondary" onClick={onPrev}>
        ‹ Prev
      </button>
      <h2 className="panel-title">{formatMonthLabel(year, month)}</h2>
      <button type="button" className="button-secondary" onClick={onNext}>
        Next ›
      </button>
    </div>
  );
}
