import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { getWeekDays, formatISODate } from '../../utils/dateUtils';
import { getLeaveTypeConfig } from '../../data/seedData';
import { Plane, AlertCircle, Plus, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';

export const WeekView: React.FC = () => {
  const {
    focusedDate,
    selectedDepartment,
    selectedLeaveType,
    getRequestsForDate,
    holidays,
    openAddLeaveModal,
    setSelectedDate,
    getDepartmentCoverageWarning,
    members,
  } = useCalendar();

  const todayStr = formatISODate(new Date());
  const weekDays = getWeekDays(focusedDate, todayStr);
  const [activeMobileDay, setActiveMobileDay] = useState<string | null>(null);

  // Helper to filter day requests
  const getFilteredDayRequests = (dateString: string) => {
    const allRequests = getRequestsForDate(dateString);
    return allRequests.filter((req) => {
      const matchesDept =
        selectedDepartment === 'All' || req.department === selectedDepartment;
      const matchesType =
        selectedLeaveType === 'All' || req.leaveType === selectedLeaveType;
      return matchesDept && matchesType;
    });
  };

  return (
    <div>
      {/* Rolling 7-day helper notice */}
      <div className="px-3.5 py-1.5 bg-neutral-50/90 border-b border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <strong className="text-neutral-800 font-semibold">Active Window:</strong> Present Day &amp; Next 6 Days
        </span>
        <span className="text-[10px] text-neutral-400 hidden xs:inline">
          Past week days omitted
        </span>
      </div>

      {/* MOBILE WEEK VIEW (< sm screens) */}
      <div className="block sm:hidden">
        {/* Quick Day Selector Strip */}
        <div className="grid grid-cols-7 gap-1 p-2 bg-neutral-50/90 border-b border-neutral-200">
          {weekDays.map((day) => {
            const reqs = getFilteredDayRequests(day.dateString);
            const isSelected = activeMobileDay === day.dateString;

            return (
              <button
                key={day.dateString}
                onClick={() =>
                  setActiveMobileDay(isSelected ? null : day.dateString)
                }
                className={`flex flex-col items-center py-1.5 px-0.5 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : day.isToday
                    ? 'bg-neutral-200/80 text-neutral-900 font-bold ring-1 ring-neutral-400/40'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span className={`text-[10px] uppercase font-semibold leading-none ${
                  isSelected ? 'text-neutral-300' : day.isToday ? 'text-neutral-900 font-bold' : 'text-neutral-400'
                }`}>
                  {day.dayName}
                </span>
                <span className="text-xs font-bold mt-1 leading-none">
                  {day.dayNumber}
                </span>
                {day.isToday && (
                  <span className={`text-[7.5px] font-extrabold uppercase tracking-tight leading-none mt-0.5 ${
                    isSelected ? 'text-neutral-200' : 'text-neutral-700'
                  }`}>
                    Today
                  </span>
                )}
                {reqs.length > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Stacked Daily Cards for Mobile */}
        <div className="divide-y divide-neutral-200">
          {weekDays
            .filter((day) => !activeMobileDay || day.dateString === activeMobileDay)
            .map((day) => {
              const filteredRequests = getFilteredDayRequests(day.dateString);
              const holiday = holidays.find((h) => h.date === day.dateString);
              const warning =
                selectedDepartment !== 'All'
                  ? getDepartmentCoverageWarning(day.dateString, selectedDepartment as any)
                  : null;

              return (
                <div
                  key={day.dateString}
                  className={`p-3.5 transition-colors ${
                    day.isToday ? 'bg-neutral-50/60' : 'bg-white'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          day.isToday
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900">
                            {day.dayName}, {day.monthName} {day.dayNumber}
                          </span>
                          {day.isToday && (
                            <span className="text-[9.5px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-1.5 py-0.2 rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {filteredRequests.length} scheduled out
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openAddLeaveModal(day.dateString)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1 min-h-[32px]"
                        title="Add leave for this day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Add</span>
                      </button>
                      <button
                        onClick={() => setSelectedDate(day.dateString)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
                        title="View Day Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Holiday banner */}
                  {holiday && (
                    <div
                      className="mt-2 text-[11px] bg-violet-50 text-violet-800 border border-violet-200 rounded-lg px-2.5 py-1 font-semibold flex items-center gap-1.5"
                      title={holiday.name}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>{holiday.name}</span>
                    </div>
                  )}

                  {/* Coverage warning */}
                  {warning && warning.isWarning && (
                    <div
                      className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1"
                      title={warning.message}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{warning.message}</span>
                    </div>
                  )}

                  {/* Leave list */}
                  <div className="mt-2.5 space-y-1.5">
                    {filteredRequests.length === 0 ? (
                      <div className="py-2 px-3 rounded-xl bg-neutral-50/80 border border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                        <span className="text-[11px]">All team members available</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    ) : (
                      filteredRequests.map((req) => {
                        const member = members.find((m) => m.id === req.memberId);
                        const cfg = getLeaveTypeConfig(req.leaveType);

                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedDate(day.dateString)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer ${cfg.bgClass}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  member?.avatarColor || 'bg-neutral-800 text-white'
                                }`}
                              >
                                {member?.avatarInitials || req.memberName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-neutral-900 truncate">
                                  {req.memberName}
                                </p>
                                <p className="text-[10px] text-neutral-500 truncate">
                                  {req.department}
                                  {req.reason ? ` • "${req.reason}"` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {req.isOutOfIsland && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-semibold">
                                  <Plane className="w-3 h-3 text-sky-600" />
                                  <span className="hidden xs:inline">Away</span>
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.badgeBg} ${cfg.borderClass}`}>
                                {req.leaveType || 'AL'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* DESKTOP / TABLET WEEK VIEW (sm+ screens) */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-[760px] grid grid-cols-7 divide-x divide-neutral-200 border-b border-neutral-200">
          {weekDays.map((day) => {
            const filteredRequests = getFilteredDayRequests(day.dateString);
            const holiday = holidays.find((h) => h.date === day.dateString);
            const warning =
              selectedDepartment !== 'All'
                ? getDepartmentCoverageWarning(day.dateString, selectedDepartment as any)
                : null;

            return (
              <div
                key={day.dateString}
                className={`flex flex-col min-h-[360px] sm:min-h-[440px] transition-colors ${
                  day.isToday
                    ? 'bg-neutral-50/60'
                    : day.isWeekend
                    ? 'bg-neutral-50/30'
                    : 'bg-white'
                }`}
              >
                {/* Day Header */}
                <div
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`p-3 border-b border-neutral-200 cursor-pointer group hover:bg-neutral-100/70 transition-colors ${
                    day.isToday ? 'bg-neutral-100/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          day.isToday ? 'text-neutral-900' : day.isWeekend ? 'text-neutral-400' : 'text-neutral-600'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      {day.isToday && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wide bg-neutral-900 text-white px-1.5 py-0.2 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddLeaveModal(day.dateString);
                      }}
                      title="Add leave for this day"
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-900 p-0.5 rounded transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        day.isToday
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-800 group-hover:bg-neutral-200/80'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {filteredRequests.length > 0 && (
                      <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 rounded-full">
                        {filteredRequests.length} off
                      </span>
                    )}
                  </div>

                  {/* Holiday banner */}
                  {holiday && (
                    <div
                      className="mt-1.5 text-[10px] bg-purple-50 text-purple-700 border border-purple-200/80 rounded px-1.5 py-0.5 font-semibold truncate"
                      title={holiday.name}
                    >
                      {holiday.name}
                    </div>
                  )}

                  {/* Coverage warning */}
                  {warning && warning.isWarning && (
                    <div
                      className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5"
                      title={warning.message}
                    >
                      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{warning.message}</span>
                    </div>
                  )}
                </div>

                {/* Day Requests List */}
                <div
                  className="flex-1 p-2 space-y-1.5 overflow-y-auto cursor-pointer"
                  onClick={() => setSelectedDate(day.dateString)}
                >
                  {filteredRequests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-8 text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-neutral-300 mb-1" />
                      <span className="text-[10px] text-neutral-400 font-medium">All present</span>
                    </div>
                  ) : (
                    filteredRequests.map((req) => {
                      const cfg = getLeaveTypeConfig(req.leaveType);
                      const shortCode = req.leaveType || 'AL';

                      return (
                        <div
                          key={req.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(day.dateString);
                          }}
                          className={`p-1.5 rounded-lg text-xs font-medium border ${cfg.bgClass} hover:opacity-90 transition-all flex items-center justify-between gap-1 shadow-2xs group/card`}
                          title={`${req.memberName} (${cfg.label})${
                            req.isOutOfIsland ? ' - Out of Island ✈' : ''
                          } - ${req.reason}`}
                        >
                          {/* Member Name with color dot */}
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`}></span>
                            <span className="font-semibold text-[11px] truncate">
                              {req.memberName.split(' ')[0]}
                            </span>
                          </div>

                          {/* Right side: Airplane icon & Leave code */}
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
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
