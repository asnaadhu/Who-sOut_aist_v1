import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { LEAVE_TYPE_CONFIG, getLeaveTypeConfig } from '../../data/seedData';
import { formatISODate, isWeekend, isDateInRange } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Users, Plane } from 'lucide-react';
import { DayDetailModal } from './DayDetailModal';

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

export const TimelineView: React.FC = () => {
  const {
    members,
    requests,
    holidays,
    currentYear,
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    selectedDepartment,
    selectedLeaveType,
    selectedDate,
    setSelectedDate,
  } = useCalendar();

  // Calculate days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatISODate(date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'narrow' });
    const weekend = isWeekend(date);
    const isToday = dateStr === formatISODate(new Date());
    const holiday = holidays.find((h) => h.date === dateStr);
    return { day, date, dateStr, dayOfWeek, weekend, isToday, holiday };
  });

  // Filter members by selected department
  const filteredMembers = members.filter((m) => {
    if (selectedDepartment !== 'All' && m.department !== selectedDepartment) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100/80 shadow-sm shadow-teal-900/5 overflow-hidden">
        {/* Navigation Bar */}
        <div className="p-3.5 sm:p-4 border-b border-teal-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-neutral-900 tracking-tight truncate">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <span className="text-[10px] sm:text-xs bg-teal-50 text-teal-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md font-medium border border-teal-100 shrink-0">
              {filteredMembers.length} Members
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 sm:p-2 text-neutral-600 hover:text-teal-800 bg-white hover:bg-teal-50/50 border border-teal-100/80 rounded-lg transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 sm:p-2 text-neutral-600 hover:text-teal-800 bg-white hover:bg-teal-50/50 border border-teal-100/80 rounded-lg transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="md:hidden px-4 py-1.5 bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between border-b border-neutral-100">
          <span>&larr; Swipe horizontally to explore full month &rarr;</span>
          <span className="font-mono text-[10px]">31 Days</span>
        </div>

        {/* Scrollable Timeline Grid */}
        <div className="overflow-x-auto relative no-scrollbar sm:scrollbar">
          <div className="min-w-[850px] sm:min-w-[980px]">
            {/* Table Header: Days of month */}
            <div className="flex border-b border-neutral-200 bg-neutral-50/90 sticky top-0 z-20">
              {/* Member Column Header */}
              <div className="w-40 sm:w-56 shrink-0 p-2.5 sm:p-3 font-semibold text-xs text-neutral-500 uppercase tracking-wider border-r border-neutral-200 bg-neutral-50 sticky left-0 z-30 shadow-xs">
                Team Member
              </div>

              {/* Days Columns */}
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(28px, 1fr))` }}>
                {daysArray.map(({ day, dayOfWeek, weekend, isToday, holiday, dateStr }) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-1 sm:p-1.5 text-center border-r border-neutral-200 transition-colors ${
                      isToday
                        ? 'bg-teal-800 text-white font-bold'
                        : weekend
                        ? 'bg-neutral-100/70 text-neutral-400'
                        : holiday
                        ? 'bg-cyan-50 text-cyan-800 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                    title={holiday ? `${holiday.name} (${dateStr})` : dateStr}
                  >
                    <div className="text-[9px] sm:text-[10px] uppercase">{dayOfWeek}</div>
                    <div className="text-[11px] sm:text-xs font-semibold">{day}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Member Rows */}
            <div className="divide-y divide-neutral-200">
              {filteredMembers.map((member) => {
                // Find all requests for this member
                const memberRequests = requests.filter(
                  (r) =>
                    r.memberId === member.id &&
                    (r.status === 'approved' || r.status === 'pending')
                );

                return (
                  <div key={member.id} className="flex hover:bg-neutral-50/40 transition-colors">
                    {/* Left Sticky Column: Member Info */}
                    <div className="w-40 sm:w-56 shrink-0 p-2 sm:p-3 border-r border-neutral-200 flex items-center gap-2 sm:gap-2.5 bg-white sticky left-0 z-10 shadow-xs">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${member.avatarColor}`}
                      >
                        {member.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{member.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate">
                          {member.department} &bull; {member.jobTitle}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Days for this Member */}
                    <div
                      className="flex-1 grid"
                      style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(28px, 1fr))` }}
                    >
                      {daysArray.map(({ dateStr, weekend, isToday, holiday }) => {
                        // Check if member has active request on this date
                        const req = memberRequests.find((r) =>
                          isDateInRange(dateStr, r.startDate, r.endDate)
                        );

                        const isFilteredOut =
                          selectedLeaveType !== 'All' && req && req.leaveType !== selectedLeaveType;

                        const cfg = req ? getLeaveTypeConfig(req.leaveType) : null;

                        return (
                          <div
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`h-12 border-r border-neutral-200 relative p-1 flex items-center justify-center cursor-pointer transition-colors ${
                              isToday
                                ? 'bg-teal-800/5'
                                : weekend
                                ? 'bg-neutral-50'
                                : 'hover:bg-neutral-100/50'
                            }`}
                          >
                            {req && !isFilteredOut && cfg && (
                              <div
                                className={`w-full h-8 rounded-md flex items-center justify-center text-[10px] font-bold border transition-transform hover:scale-105 shadow-2xs ${cfg.bgClass}`}
                                title={`${member.name}: ${cfg.label}${req.isOutOfIsland ? ' (Out of Island ✈)' : ''} (${req.startDate} to ${req.endDate}) - "${req.reason}"`}
                              >
                                <span className="truncate px-0.5 flex items-center gap-0.5">
                                  <span>
                                    {req.durationType === 'morning'
                                      ? 'AM'
                                      : req.durationType === 'afternoon'
                                      ? 'PM'
                                      : (req.leaveType || cfg.label.split(' ')[0])}
                                  </span>
                                  {req.isOutOfIsland && (
                                    <Plane className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                                  )}
                                </span>
                              </div>
                            )}

                            {!req && holiday && (
                              <div
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                                title={`Holiday: ${holiday.name}`}
                              ></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <DayDetailModal dateStr={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
};
