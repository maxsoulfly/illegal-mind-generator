const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

// All functions operate on local time and 'YYYY-MM-DD' string keys, never
// raw Date objects in storage/comparisons, to avoid timezone drift.
export function toIsoDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromIsoDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getWeekday(isoDate) {
  return fromIsoDate(isoDate).getDay();
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Full weeks (Sun-start), including leading/trailing days from adjacent
// months so the grid always renders complete rows.
export function getMonthGridDays(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = getDaysInMonth(year, month);
  const leadingCount = firstOfMonth.getDay();

  const gridStart = new Date(year, month, 1 - leadingCount);
  const totalCells = Math.ceil((leadingCount + daysInMonth) / 7) * 7;

  const days = [];
  for (let i = 0; i < totalCells; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);

    days.push({
      isoDate: toIsoDate(date),
      inCurrentMonth: date.getMonth() === month,
    });
  }

  return days;
}

export function addMonths(year, month, delta) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function addDays(isoDate, delta) {
  const date = fromIsoDate(isoDate);
  date.setDate(date.getDate() + delta);
  return toIsoDate(date);
}

export function isToday(isoDate) {
  return isoDate === toIsoDate(new Date());
}

export function isBeforeToday(isoDate) {
  return isoDate < toIsoDate(new Date());
}

export function compareIsoDates(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function formatMonthLabel(year, month) {
  return `${MONTH_LABELS[month]} ${year}`;
}

export function formatDayLabel(isoDate) {
  const date = fromIsoDate(isoDate);
  return `${DAY_LABELS[date.getDay()]} ${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}
