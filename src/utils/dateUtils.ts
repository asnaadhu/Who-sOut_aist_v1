import { TimeOffRequest, DayDuration } from '../types';

/**
 * Format date to YYYY-MM-DD
 */
export function formatISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a local Date object
 */
export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Pretty human readable date: e.g. "Sep 18, 2026"
 */
export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseISODate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Pretty range: e.g. "Sep 18 - Sep 22, 2026"
 */
export function formatDateRange(startDate: string, endDate: string, durationType: DayDuration = 'full'): string {
  const s = parseISODate(startDate);
  const e = parseISODate(endDate);
  const durationLabel = durationType === 'morning' ? ' (Morning)' : durationType === 'afternoon' ? ' (Afternoon)' : '';

  if (startDate === endDate) {
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${durationLabel}`;
  }

  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = s.getMonth() === e.getMonth() && sameYear;

  if (sameMonth) {
    return `${s.toLocaleDateString('en-US', { month: 'short' })} ${s.getDate()} - ${e.getDate()}, ${e.getFullYear()}${durationLabel}`;
  }

  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${durationLabel}`;
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Check if date is a weekend (Saturday=6, Sunday=0)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Calculate working/leave days between two dates inclusive
 */
export function calculateWorkingDays(startDateStr: string, endDateStr: string, durationType: DayDuration = 'full'): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = parseISODate(startDateStr);
  const end = parseISODate(endDateStr);

  if (start > end) return 0;

  // Single day selection (e.g. 19/09/2026 to 19/09/2026)
  if (startDateStr === endDateStr) {
    return durationType === 'morning' || durationType === 'afternoon' ? 0.5 : 1;
  }

  // Multi-day range: count business working days (Mon-Fri)
  let count = 0;
  const curr = new Date(start);
  while (curr <= end) {
    if (!isWeekend(curr)) {
      count += 1;
    }
    curr.setDate(curr.getDate() + 1);
  }

  // If all selected days fall on weekend (e.g. weekend shift or weekend leave tracking),
  // count the actual calendar days so tracking is never 0 days.
  if (count === 0) {
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    count = Math.max(1, totalDays);
  }

  if (durationType === 'morning' || durationType === 'afternoon') {
    count = Math.max(0.5, count - 0.5);
  }

  return count;
}

/**
 * Check if dateStr falls within [start, end]
 */
export function isDateInRange(dateStr: string, startDateStr: string, endDateStr: string): boolean {
  return dateStr >= startDateStr && dateStr <= endDateStr;
}

/**
 * Returns month calendar matrix (42 cells: 6 weeks)
 */
export interface CalendarCell {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export function generateCalendarGrid(year: number, month: number, todayStr: string): CalendarCell[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...

  // Start from Sunday of the first week
  const startDate = new Date(year, month, 1 - startingDayOfWeek);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const dateString = formatISODate(current);

    cells.push({
      date: current,
      dateString,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
      isToday: dateString === todayStr,
      isWeekend: isWeekend(current),
    });
  }

  return cells;
}

/**
 * Check if request covers a specific date
 */
export function doesRequestCoverDate(req: TimeOffRequest, dateStr: string): boolean {
  if (req.status !== 'approved' && req.status !== 'pending') return false;
  return isDateInRange(dateStr, req.startDate, req.endDate);
}

export interface WeekDayCell {
  date: Date;
  dateString: string;
  dayName: string;
  fullDayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  isWeekend: boolean;
}

/**
 * Returns 7 days starting from baseDate (First day: present day / baseDate + next 6 days).
 * Past week days are omitted since upcoming availability is the priority.
 */
export function getWeekDays(baseDate: Date, todayStr: string): WeekDayCell[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Start directly from baseDate (Day 0: present day / focused date)
  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const days: WeekDayCell[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const dateString = formatISODate(current);
    const dayOfWeek = current.getDay();

    days.push({
      date: current,
      dateString,
      dayName: dayNames[dayOfWeek],
      fullDayName: fullDayNames[dayOfWeek],
      dayNumber: current.getDate(),
      monthName: current.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateString === todayStr,
      isWeekend: isWeekend(current),
    });
  }

  return days;
}

/**
 * Format week range: e.g. "Sep 13 – Sep 19, 2026"
 */
export function formatWeekRange(weekDays: WeekDayCell[]): string {
  if (!weekDays || weekDays.length === 0) return '';
  const first = weekDays[0].date;
  const last = weekDays[weekDays.length - 1].date;

  const firstMonth = first.toLocaleDateString('en-US', { month: 'short' });
  const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });
  const firstYear = first.getFullYear();
  const lastYear = last.getFullYear();

  if (firstMonth === lastMonth && firstYear === lastYear) {
    return `${firstMonth} ${first.getDate()} – ${last.getDate()}, ${firstYear}`;
  }

  if (firstYear === lastYear) {
    return `${firstMonth} ${first.getDate()} – ${lastMonth} ${last.getDate()}, ${firstYear}`;
  }

  return `${firstMonth} ${first.getDate()}, ${firstYear} – ${lastMonth} ${last.getDate()}, ${lastYear}`;
}

/**
 * Format full date header: e.g. "Friday, September 18, 2026"
 */
export function formatFullDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
