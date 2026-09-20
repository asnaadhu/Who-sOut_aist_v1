import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Sparkles,
  Users,
  Plane,
} from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import {
  generateCalendarGrid,
  formatISODate,
  getWeekDays,
  formatWeekRange,
} from '../../utils/dateUtils';
import { LEAVE_TYPE_CONFIG, getLeaveTypeConfig } from '../../data/seedData';
import { DayDetailModal } from './DayDetailModal';
import { WeekView } from './WeekView';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthlyCalendar: React.FC = () => {
  const {
    currentYear,
    currentMonth,
    calendarMode,
    setCalendarMode,
    focusedDate,
    goToPrevious,
    goToNext,
    goToToday,
    selectedDate,
    setSelectedDate,
    selectedDepartment,
    selectedLeaveType,
    getRequestsForDate,
    holidays,
    members,
    getDepartmentCoverageWarning,
  } = useCalendar();

  const todayStr = formatISODate(new Date());
  const grid = generateCalendarGrid(currentYear, currentMonth, todayStr);

  let headerTitle = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  if (calendarMode === 'week') {
    const weekDays = getWeekDays(focusedDate, todayStr);
    headerTitle = formatWeekRange(weekDays);
  }

  const isAtOrBeforeToday = calendarMode === 'week' && formatISODate(focusedDate) <= todayStr;

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100/80 shadow-sm shadow-teal-900/5 overflow-hidden">
        {/* Calendar Navigation Header */}
        <div className="p-3 sm:p-5 border-b border-teal-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Current Date Range and Today Button */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">
              {headerTitle}
            </h2>
            <button
              id="calendar-today-btn"
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200 shrink-0"
            >
              Today
            </button>
          </div>

          {/* Right: View Switcher (Week, Month) & Navigation Arrows */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* View Switcher: Week Month */}
            <div className="flex items-center gap-1 bg-teal-50/60 p-1 rounded-xl border border-teal-100/80">
              <button
                id="calendar-view-week-btn"
                onClick={() => setCalendarMode('week')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  calendarMode === 'week'
                    ? 'bg-white text-teal-900 shadow-sm border border-teal-100 font-bold'
                    : 'text-neutral-600 hover:text-teal-900 hover:bg-teal-100/50'
                }`}
              >
                Week
              </button>
              <button
                id="calendar-view-month-btn"
                onClick={() => setCalendarMode('month')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  calendarMode === 'month'
                    ? 'bg-white text-teal-900 shadow-sm border border-teal-100 font-bold'
                    : 'text-neutral-600 hover:text-teal-900 hover:bg-teal-100/50'
                }`}
              >
                Month
              </button>
            </div>

            {/* Previous & Next navigation */}
            <div className="flex items-center gap-1">
              <button
                id="calendar-prev-btn"
                onClick={goToPrevious}
                disabled={isAtOrBeforeToday}
                className={`p-1.5 sm:p-2 border border-neutral-200 rounded-lg transition-colors shadow-2xs min-w-[34px] min-h-[34px] flex items-center justify-center ${
                  isAtOrBeforeToday
                    ? 'text-neutral-300 bg-neutral-50 cursor-not-allowed border-neutral-200/60'
                    : 'text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100'
                }`}
                aria-label="Previous"
                title={isAtOrBeforeToday ? 'Past week days are not shown' : `Previous ${calendarMode}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="calendar-next-btn"
                onClick={goToNext}
                className="p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors shadow-2xs min-w-[34px] min-h-[34px] flex items-center justify-center"
                aria-label="Next"
                title={`Next ${calendarMode}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Router */}
        {calendarMode === 'week' && <WeekView />}

        {calendarMode === 'month' && (
          <>
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-teal-50 bg-teal-50/40 text-center text-[10px] sm:text-xs font-bold text-teal-700 uppercase tracking-wider py-2 sm:py-2.5">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`${idx === 0 || idx === 6 ? 'text-teal-400' : 'text-teal-700'}`}
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

        {/* 42 Calendar Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-200 border-b border-neutral-200">
          {grid.map((cell) => {
            const allDayRequests = getRequestsForDate(cell.dateString);

            // Filter requests based on user filters
            const filteredRequests = allDayRequests.filter((req) => {
              if (selectedDepartment !== 'All' && req.department !== selectedDepartment) {
                return false;
              }
              if (selectedLeaveType !== 'All' && req.leaveType !== selectedLeaveType) {
                return false;
              }
              return true;
            });

            const holiday = holidays.find((h) => h.date === cell.dateString);
            const engWarning = getDepartmentCoverageWarning(cell.dateString, 'Engineering');
            const totalMembersCount = members.length;
            const awayCount = allDayRequests.length;
            const availableCount = Math.max(0, totalMembersCount - awayCount);

            return (
              <div
                key={cell.dateString}
                id={`calendar-cell-${cell.dateString}`}
                onClick={() => setSelectedDate(cell.dateString)}
                className={`min-h-[64px] sm:min-h-[125px] p-1 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group active:bg-neutral-100 ${
                  cell.isCurrentMonth ? 'bg-white hover:bg-neutral-50/80' : 'bg-neutral-50/50 hover:bg-neutral-100/60'
                } ${cell.isToday ? 'ring-2 ring-teal-700 ring-inset z-10' : ''}`}
              >
                {/* Cell Header: Date Number & Holiday/Alert indicators */}
                <div>
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span
                      className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full transition-colors ${
                        cell.isToday
                          ? 'bg-teal-800 text-white'
                          : cell.isCurrentMonth
                          ? 'text-neutral-800 group-hover:text-neutral-900'
                          : 'text-neutral-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Coverage warning badge */}
                    {engWarning && cell.isCurrentMonth && (
                      <span
                        className="text-[8.5px] sm:text-[10px] bg-amber-100 text-amber-800 font-semibold px-0.5 sm:px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-amber-200"
                        title={engWarning.message}
                      >
                        <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                        <span className="hidden md:inline">Coverage</span>
                      </span>
                    )}
                  </div>

                  {/* Public Holiday Pill */}
                  {holiday && (
                    <div
                      className="mb-0.5 sm:mb-1 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-cyan-50 text-cyan-800 text-[8.5px] sm:text-[10px] font-medium border border-cyan-200 truncate flex items-center gap-0.5 sm:gap-1"
                      title={holiday.name}
                    >
                      <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-cyan-600 shrink-0" />
                      <span className="truncate">{holiday.name}</span>
                    </div>
                  )}

                  {/* Mobile Compact Indicators (< sm screens) */}
                  <div className="flex sm:hidden flex-wrap items-center mt-0.5">
                    {filteredRequests.length === 1 && (() => {
                      const req = filteredRequests[0];
                      const cfg = getLeaveTypeConfig(req.leaveType);
                      return (
                        <span
                          className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded border text-[9px] font-bold truncate max-w-full ${cfg.bgClass}`}
                          title={`${req.memberName} (${cfg.label})${req.isOutOfIsland ? ' [Out of Island]' : ''}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`} />
                          <span className="truncate">{req.leaveType || 'AL'}</span>
                          {req.isOutOfIsland && (
                            <Plane className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                          )}
                        </span>
                      );
                    })()}

                    {filteredRequests.length > 1 && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[9px] font-bold truncate max-w-full"
                        title={`${filteredRequests.length} team members on leave`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                        <span>{filteredRequests.length} off</span>
                        {filteredRequests.some((r) => r.isOutOfIsland) && (
                          <Plane className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Requests Pills (Max 3 visible on sm+ screens) */}
                  <div className="hidden sm:block space-y-1">
                    {filteredRequests.slice(0, 3).map((req) => {
                      const cfg = getLeaveTypeConfig(req.leaveType);
                      const shortCode = req.leaveType || 'AL';
                      return (
                        <div
                          key={req.id}
                          className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium border ${cfg.bgClass} hover:opacity-90 transition-opacity flex items-center justify-between gap-1 shadow-2xs`}
                          title={`${req.memberName} (${cfg.label})${req.isOutOfIsland ? ' - Out of Island ✈' : ''} - ${req.reason}`}
                        >
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`}></span>
                            <span className="font-semibold truncate">
                              {req.memberName.split(' ')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-auto">
                            {req.isOutOfIsland && (
                              <span title="Out of island" className="flex items-center">
                                <Plane className="w-3 h-3 text-sky-600" />
                              </span>
                            )}
                            <span className={`text-[9.5px] font-bold px-1 py-0.2 rounded border ${cfg.badgeBg} ${cfg.borderClass}`}>
                              {shortCode}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {filteredRequests.length > 3 && (
                      <div className="text-[10px] text-neutral-500 font-semibold pl-1">
                        +{filteredRequests.length - 3} more off
                      </div>
                    )}
                  </div>
                </div>

                {/* Cell Footer: Availability Summary */}
                {cell.isCurrentMonth && (
                  <div className="pt-0.5 sm:pt-1 mt-0.5 sm:mt-1 border-t border-neutral-100 flex items-center justify-between text-[9px] sm:text-[10px] text-neutral-400">
                    <span className="truncate">
                      {awayCount > 0 ? (
                        <span className="font-medium text-neutral-600">
                          <span className="sm:hidden">{availableCount} in</span>
                          <span className="hidden sm:inline">{availableCount}/{totalMembersCount} in</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700/80 font-medium">
                          <span className="sm:hidden">All in</span>
                          <span className="hidden sm:inline">All in office</span>
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>
      )}
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal dateStr={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
};
