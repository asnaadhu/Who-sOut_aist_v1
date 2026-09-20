import React, { useState, useMemo, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { LeaveType, DayDuration } from '../../types';
import { LEAVE_TYPE_CONFIG, getLeaveTypeConfig } from '../../data/seedData';
import {
  calculateWorkingDays,
  formatISODate,
  formatDDMMYYYY,
  doesRequestCoverDate,
  formatReadableDate,
} from '../../utils/dateUtils';
import {
  X,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  Plane,
} from 'lucide-react';

export const RequestModal: React.FC = () => {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    requestInitialDate,
    activeMember,
    members,
    requests,
    getMemberUsedDays,
    submitRequest,
  } = useCalendar();

  const isAdmin = activeMember.role === 'admin';
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember.id);

  // Requestor can add ONLY their own leave, admin can select any member or themselves
  const targetMember = useMemo(() => {
    if (!isAdmin) return activeMember;
    return members.find((m) => m.id === selectedMemberId) || activeMember;
  }, [isAdmin, activeMember, members, selectedMemberId]);

  const [leaveType, setLeaveType] = useState<LeaveType>('AL');
  const [isOutOfIsland, setIsOutOfIsland] = useState<boolean>(false);
  const [isSingleDay, setIsSingleDay] = useState<boolean>(true);
  const todayISO = formatISODate(new Date());
  const [startDate, setStartDate] = useState<string>(todayISO);
  const [endDate, setEndDate] = useState<string>(todayISO);
  const [reason, setReason] = useState<string>('');
  const durationType: DayDuration = 'full';

  // Pre-fill on modal open
  useEffect(() => {
    if (isRequestModalOpen) {
      setSelectedMemberId(activeMember.id);
      const defaultDate = requestInitialDate || formatISODate(new Date());
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setIsSingleDay(true);
      setIsOutOfIsland(false);
      setReason('');
    }
  }, [isRequestModalOpen, requestInitialDate, activeMember.id]);

  // Calculate working days (unconditionally declared before any return)
  const calculatedDays = useMemo(() => {
    return calculateWorkingDays(startDate, endDate, durationType);
  }, [startDate, endDate]);

  // Tracked days for this leave type (for tracking only, no balance checks)
  const used = getMemberUsedDays(targetMember.id);
  const trackedDaysThisYear = used[leaveType] ?? 0;

  // Overlap / Coverage check in the same department (unconditionally declared before any return)
  const departmentalConflicts = useMemo(() => {
    if (!startDate || !endDate) return [];
    return requests.filter((r) => {
      if (r.memberId === targetMember.id) return false;
      if (r.department !== targetMember.department) return false;
      if (r.status !== 'approved' && r.status !== 'pending') return false;

      // Check date range intersection
      const startOverlap = r.startDate <= endDate && r.endDate >= startDate;
      return startOverlap;
    });
  }, [startDate, endDate, targetMember, requests]);

  if (!isRequestModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveEndDate = isSingleDay ? startDate : endDate;
    if (!startDate || !effectiveEndDate || calculatedDays <= 0) return;

    submitRequest({
      memberId: targetMember.id,
      leaveType,
      isOutOfIsland,
      startDate,
      endDate: effectiveEndDate,
      durationType,
      daysCount: calculatedDays,
      reason,
    });
  };

  const leaveTypesList: LeaveType[] = ['DO', 'PH', 'AL', 'RR', 'SL', 'FRL'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-teal-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white/95 backdrop-blur-md rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-teal-900/20 border border-teal-100/80 w-full max-w-xl max-h-[92vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center bg-teal-50/40">
          <div className="w-10 h-1 bg-teal-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-teal-50 flex items-center justify-between bg-teal-50/40">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
              Add Leave to Calendar
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 truncate">
              Directly schedule your time off on the team calendar
            </p>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5">
          {/* User Selection: Admin can choose user or themselves; Requestor is strictly locked */}
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/80">
            {isAdmin ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800">
                    Schedule Leave For:
                  </label>
                  <span className="text-[10px] font-bold bg-gradient-to-r from-teal-700 to-teal-900 text-white px-2 py-0.2 rounded-full">
                    Admin Privilege
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${targetMember.avatarColor}`}
                  >
                    {targetMember.avatarInitials}
                  </div>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="flex-1 text-xs border border-neutral-300 rounded-lg p-2 bg-white font-semibold text-neutral-900 shadow-2xs"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} [{m.tmId || m.id.replace('mem-', 'TM-')}] ({m.department}) {m.id === activeMember.id ? '— (You)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${targetMember.avatarColor}`}
                >
                  {targetMember.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 truncate">
                      {targetMember.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded">
                      {targetMember.tmId || targetMember.id.replace('mem-', 'TM-')}
                    </span>
                    <span className="text-[10px] bg-teal-50 text-teal-700 font-bold border border-teal-200 px-1.5 py-0.2 rounded">
                      Requestor
                    </span>
                    <span className="text-[10px] bg-white border border-neutral-200 text-neutral-600 px-1.5 py-0.2 rounded font-medium">
                      {targetMember.department}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    Adding leave for yourself &bull; Requestors can add/delete only their own leave
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Leave Type Cards */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Select Leave Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {leaveTypesList.map((type) => {
                const cfg = getLeaveTypeConfig(type);
                const isSelected = leaveType === type;
                return (
                  <div
                    key={type}
                    onClick={() => setLeaveType(type)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-teal-700 bg-gradient-to-br from-teal-700 to-teal-800 text-white shadow-md ring-1 ring-teal-700'
                        : 'border-neutral-200 bg-white hover:border-teal-300 text-neutral-800'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-white' : cfg.dotColor
                      }`}
                    ></span>
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {cfg.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Out of Island Option (Optional) */}
          <div className="p-3 sm:p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-xl transition-all">
            <label
              htmlFor="out-of-island-checkbox"
              className="flex items-center justify-between cursor-pointer select-none gap-3"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4 text-sky-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">
                      Out of Island
                    </span>
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-100/90 border border-sky-200 px-1.5 py-0.2 rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5 truncate sm:whitespace-normal">
                    Tick if going out of island (displays small ✈ icon in calendar view)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="checkbox"
                  id="out-of-island-checkbox"
                  checked={isOutOfIsland}
                  onChange={(e) => setIsOutOfIsland(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500 focus:ring-2 cursor-pointer"
                />
              </div>
            </label>
          </div>

          {/* Leave Span: 1 Day vs Multi-Day */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                Leave Span
              </label>
              <span className="text-[11px] text-neutral-500">
                {isSingleDay ? '1 Day selected (same date)' : 'Spanning multiple dates'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-teal-50/60 rounded-xl border border-teal-100/80">
              <button
                type="button"
                id="leave-span-single-day"
                onClick={() => {
                  setIsSingleDay(true);
                  setEndDate(startDate);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  isSingleDay
                    ? 'bg-white text-teal-900 shadow-sm font-bold border border-teal-100'
                    : 'text-neutral-600 hover:text-teal-900'
                }`}
              >
                <span>1 Day (Single Date)</span>
                {isSingleDay && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                type="button"
                id="leave-span-date-range"
                onClick={() => {
                  setIsSingleDay(false);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  !isSingleDay
                    ? 'bg-white text-teal-900 shadow-sm font-bold border border-teal-100'
                    : 'text-neutral-600 hover:text-teal-900'
                }`}
              >
                <span>Date Range (Multi-Day)</span>
                {!isSingleDay && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Date Pickers */}
          {isSingleDay ? (
            <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 space-y-2">
              <label htmlFor="request-single-date" className="block text-xs font-semibold text-neutral-800">
                Select Date for 1 Day Leave
              </label>
              <input
                id="request-single-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setStartDate(val);
                  setEndDate(val);
                }}
                className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-white focus:bg-white focus:ring-1 focus:ring-neutral-400 font-medium text-neutral-900"
                required
              />
              <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-0.5">
                <span>
                  Date scheduled: <strong className="text-neutral-900 font-bold">{formatDDMMYYYY(startDate)} to {formatDDMMYYYY(startDate)}</strong>
                </span>
                <span className="text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  1 Day Leave
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="request-start-date" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Start Date
                </label>
                <input
                  id="request-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStartDate(val);
                    if (val > endDate) setEndDate(val);
                  }}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-400 font-medium text-neutral-900"
                  required
                />
                <span className="block text-[11px] text-neutral-500 mt-1">
                  {formatDDMMYYYY(startDate)} ({formatReadableDate(startDate)})
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="request-end-date" className="block text-xs font-semibold text-neutral-700">
                    End Date
                  </label>
                  {startDate !== endDate && (
                    <button
                      type="button"
                      onClick={() => setEndDate(startDate)}
                      className="text-[10px] font-bold text-neutral-700 hover:text-neutral-900 underline"
                      title="Set End Date same as Start Date for 1 Day Leave"
                    >
                      Make 1 Day ({formatDDMMYYYY(startDate)})
                    </button>
                  )}
                </div>
                <input
                  id="request-end-date"
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-400 font-medium text-neutral-900"
                  required
                />
                <span className="block text-[11px] text-neutral-500 mt-1">
                  {formatDDMMYYYY(endDate)} ({formatReadableDate(endDate)})
                </span>
              </div>
            </div>
          )}

          {/* Working Days & Tracking Summary Box */}
          <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Selected Period:</span>
              <span className="font-bold text-neutral-900">
                {formatDDMMYYYY(startDate)} to {formatDDMMYYYY(isSingleDay ? startDate : endDate)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Calculated Days:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-900 text-sm">
                  {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                </span>
                {startDate === (isSingleDay ? startDate : endDate) && (
                  <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-semibold">
                    1 Day Leave
                  </span>
                )}
              </div>
            </div>

            {trackedDaysThisYear !== null && (
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/80">
                <span className="text-neutral-600">Recorded Year-to-Date:</span>
                <span className="font-semibold text-neutral-800">
                  {trackedDaysThisYear} {trackedDaysThisYear === 1 ? 'day' : 'days'} logged
                </span>
              </div>
            )}

            <p className="text-[11px] text-neutral-500 pt-0.5">
              Entries are recorded on the team calendar for leave taken tracking.
            </p>
          </div>

          {/* Departmental Team Coverage Check Notice */}
          {departmentalConflicts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Department Overlap Alert:</span>
              </div>
              <p className="text-[11px] text-amber-800">
                The following {targetMember.department} teammate(s) already have time off scheduled in this window:
              </p>
              <ul className="list-disc list-inside text-[11px] text-amber-800 pl-1 space-y-0.5">
                {departmentalConflicts.map((c) => (
                  <li key={c.id}>
                    <span className="font-semibold">{c.memberName}</span> ({formatReadableDate(c.startDate)} - {formatReadableDate(c.endDate)})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Reason / Notes (Optional)
            </label>
            <textarea
              id="request-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family vacation, personal appointment, attending conference..."
              className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-neutral-900"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-teal-50 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:text-teal-800 hover:bg-teal-50 rounded-xl transition-colors text-center min-h-[40px] flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              id="submit-leave-request-btn"
              type="submit"
              disabled={calculatedDays <= 0}
              className={`px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                calculatedDays > 0
                  ? 'bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 cursor-pointer active:scale-98 shadow-md shadow-teal-900/10'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Add {calculatedDays > 0 ? (calculatedDays === 1 ? '1 Day' : `${calculatedDays} Days`) : ''} Leave to Calendar
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
