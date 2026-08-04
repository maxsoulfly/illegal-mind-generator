import CalendarDayCell from './CalendarDayCell';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarMonthGrid({ days, onLoadEntry, onSlotClick, calendar }) {
  return (
    <div className="calendar-month-grid">
      {WEEKDAY_HEADERS.map((label) => (
        <div key={label} className="calendar-weekday-header">{label}</div>
      ))}

      {days.map((day) => (
        <CalendarDayCell
          key={day.isoDate}
          day={day}
          onLoadEntry={onLoadEntry}
          onSlotClick={onSlotClick}
          calendar={calendar}
        />
      ))}
    </div>
  );
}
