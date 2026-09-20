import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { formatReadableDate, isWeekend } from '../../utils/dateUtils';
import { LEAVE_TYPE_CONFIG, getLeaveTypeConfig } from '../../data/seedData';
import {
  X,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Briefcase,
  ChevronRight,
  Sparkles,
  Trash2,
  Plane,
} from 'lucide-react';
import { Department, LeaveType } from '../../types';

interface DayDetailModalProps {
  dateStr: string;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ dateStr, onClose }) => {
  const {
    members,
    getRequestsForDate,
    holidays,
    getDepartmentCoverageWarning,
    openAddLeaveModal,
    activeMember,
    cancelRequest,
  } = useCalendar();

  const requests = getRequestsForDate(dateStr);
  const holiday = holidays.find((h) => h.date === dateStr);
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const weekend = isWeekend(dateObj);

  // Group members into away vs working
  const awayMemberIds = new Set(requests.map((r) => r.memberId));
  const workingMembers = members.filter((m) => !awayMemberIds.has(m.id));

  const departments: Department[] = ['Engineering', 'Product', 'Design', 'Marketing', 'Operations'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-teal-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center bg-neutral-50/70">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                  {formatReadableDate(dateStr)}
                </h3>
                {weekend && (
                  <span className="text-[10px] sm:text-xs bg-neutral-200 text-neutral-700 px-1.5 sm:px-2 py-0.2 rounded-full font-medium shrink-0">
                    Weekend
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 truncate">
                {workingMembers.length} available &bull; {requests.length} scheduled out
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Public Holiday Banner if applicable */}
          {holiday && (
            <div className="p-3.5 bg-cyan-50 border border-cyan-200 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-cyan-900">{holiday.name}</h4>
                <p className="text-xs text-cyan-700 mt-0.5">{holiday.description}</p>
              </div>
            </div>
          )}

          {/* Department Coverage Warning pills */}
          <div className="space-y-2">
            {departments.map((dept) => {
              const warning = getDepartmentCoverageWarning(dateStr, dept);
              if (!warning) return null;
              return (
                <div
                  key={dept}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold">Coverage Notice ({dept}):</span>{' '}
                    <span>{warning.message}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scheduled Out / Away Members */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Scheduled Out ({requests.length})</span>
              </h4>
            </div>

            {requests.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-neutral-200 text-center bg-neutral-50/50">
                <p className="text-xs text-neutral-500">
                  Full team availability &mdash; No members have requested time off for this day.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {requests.map((req) => {
                  const cfg = getLeaveTypeConfig(req.leaveType);
                  return (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white transition-all shadow-2xs"
                    >
                      <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${req.memberAvatarColor}`}
                          >
                            {req.memberName
                              .split(' ')
                              .map((p) => p[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="text-xs font-bold text-neutral-900">
                                {req.memberName}
                              </span>
                              {req.isOutOfIsland && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded-full"
                                  title="Going out of island during this leave"
                                >
                                  <Plane className="w-3 h-3 text-sky-600" />
                                  <span>Out of Island</span>
                                </span>
                              )}
                              <span className="text-[11px] text-neutral-400 font-medium">
                                {req.department}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-0.5 italic">
                              &ldquo;{req.reason}&rdquo;
                            </p>
                          </div>
                        </div>

                        <div className="flex xs:flex-col items-center xs:items-end justify-between xs:justify-start gap-1.5 shrink-0 border-t xs:border-t-0 pt-1.5 xs:pt-0 border-neutral-100">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${cfg.bgClass}`}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {req.durationType === 'full'
                                ? 'Full Day'
                                : req.durationType === 'morning'
                                ? 'Morning'
                                : 'Afternoon'}
                            </span>
                          </div>

                          {/* Requestor can remove ONLY their own leave; Admin can remove any leave */}
                          {(req.memberId === activeMember.id || activeMember.role === 'admin') && (
                            <button
                              onClick={() => cancelRequest(req.id)}
                              className="text-[10px] text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 font-medium mt-0.5"
                              title={
                                req.memberId === activeMember.id
                                  ? 'Remove your scheduled leave'
                                  : 'Remove this leave as Admin'
                              }
                            >
                              <Trash2 className="w-3 h-3 text-rose-500" />
                              <span>{req.memberId === activeMember.id ? 'Remove My Leave' : 'Remove Leave'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Working / In-Office Members */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Available / On Duty ({workingMembers.length})</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {workingMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-neutral-200 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${member.avatarColor}`}
                    >
                      {member.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-900 truncate">{member.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{member.jobTitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white border border-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                    {member.department}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              openAddLeaveModal(dateStr);
            }}
            className="text-xs text-neutral-900 hover:text-neutral-700 font-semibold flex items-center gap-1.5"
          >
            <span>Add leave for this date &rarr;</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
