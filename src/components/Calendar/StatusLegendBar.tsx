import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Department, LeaveType } from '../../types';
import { LEAVE_TYPE_CONFIG } from '../../data/seedData';
import { Filter, Users, Plane } from 'lucide-react';

const DEPARTMENTS: ('All' | Department)[] = [
  'All',
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Operations',
];

const LEAVE_TYPES: { code: LeaveType; label: string }[] = [
  { code: 'DO', label: 'DO (Day Off)' },
  { code: 'PH', label: 'PH (Public Holiday)' },
  { code: 'AL', label: 'AL (Annual Leave)' },
  { code: 'RR', label: 'RR (Rest & Relax)' },
  { code: 'SL', label: 'SL (Sick Leave)' },
  { code: 'FRL', label: 'FRL (Family Responsibility)' },
];

export const StatusLegendBar: React.FC = () => {
  const {
    members,
    selectedDepartment,
    setSelectedDepartment,
    selectedLeaveType,
    setSelectedLeaveType,
  } = useCalendar();

  const availableDepartments = Array.from(
    new Set(['All', 'Engineering', 'Product', 'Design', 'Marketing', 'Operations', ...members.map((m) => m.department)])
  ).filter(Boolean);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4 mb-4 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Indicators Legend - scrollable on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-0.5">
            Legend:
          </span>

          <div className="flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-200 px-2 sm:px-2.5 py-1 rounded-lg font-medium shrink-0 text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="font-semibold">Team Leave</span>
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
              <span className="hidden sm:inline">Name + Code (DO &middot; PH &middot; AL &middot; RR &middot; SL &middot; FRL)</span>
              <span className="sm:hidden">Leave Code</span>
            </span>
          </div>

          {/* Out of Island Legend Indicator */}
          <div className="flex items-center gap-1.5 bg-sky-50 text-sky-800 border border-sky-300 px-2 sm:px-2.5 py-1 rounded-lg font-medium shrink-0 text-[11px] sm:text-xs">
            <Plane className="w-3 h-3 text-sky-600 shrink-0" />
            <span className="font-semibold">Out of Island</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-neutral-100 w-full lg:w-auto">
          <div className="flex items-center gap-1 text-xs text-neutral-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold hidden xs:inline">Filters:</span>
          </div>

          {/* Department Filter */}
          <select
            id="department-filter"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="flex-1 sm:flex-none text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg px-2 sm:px-2.5 py-1.5 font-medium transition-colors focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
          >
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Depts' : dept}
              </option>
            ))}
          </select>

          {/* Leave Type Filter */}
          <select
            id="leave-type-filter"
            value={selectedLeaveType}
            onChange={(e) => setSelectedLeaveType(e.target.value)}
            className="flex-1 sm:flex-none text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg px-2 sm:px-2.5 py-1.5 font-medium transition-colors focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
          >
            <option value="All">All Types</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
