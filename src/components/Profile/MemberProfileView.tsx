import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { LEAVE_TYPE_CONFIG, getLeaveTypeConfig } from '../../data/seedData';
import { formatReadableDate, formatDateRange } from '../../utils/dateUtils';
import { LeaveStatus, LeaveType } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Briefcase,
  Mail,
  User,
  Shield,
  FileText,
  CalendarCheck,
  ChevronRight,
  Trash2,
  Plane,
} from 'lucide-react';

const TRACKING_LEAVE_TYPES: LeaveType[] = ['AL', 'RR', 'SL', 'DO', 'PH', 'FRL', 'BT'];

export const MemberProfileView: React.FC = () => {
  const {
    activeMember,
    requests,
    getMemberUsedDays,
    cancelRequest,
    setIsRequestModalOpen,
  } = useCalendar();

  const [statusFilter, setStatusFilter] = useState<'all' | LeaveStatus>('all');

  const used = getMemberUsedDays(activeMember.id);

  // Filter requests for active member
  const memberRequests = requests.filter((r) => r.memberId === activeMember.id);

  const filteredRequests = memberRequests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const pendingCount = memberRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = memberRequests.filter((r) => r.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs shrink-0 ${activeMember.avatarColor}`}
            >
              {activeMember.avatarInitials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {activeMember.name}
                </h2>
                <span className="bg-neutral-100 text-neutral-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-neutral-200">
                  {activeMember.tmId || activeMember.id.replace('mem-', 'TM-')}
                </span>
                {activeMember.role === 'admin' ? (
                  <span className="bg-gradient-to-r from-teal-700 to-teal-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    Admin
                  </span>
                ) : (
                  <span className="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                    Requestor
                  </span>
                )}
                <span className="bg-neutral-100 text-neutral-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-neutral-200">
                  {activeMember.department}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                  {activeMember.jobTitle}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {activeMember.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Joined {formatReadableDate(activeMember.joinedDate)}
                </span>
              </div>
            </div>
          </div>

          <button
            id="profile-request-leave-btn"
            onClick={() => setIsRequestModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs font-semibold rounded-xl shadow-sm transition-all min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave to Calendar</span>
          </button>
        </div>
      </div>

      {/* Leave Tracking Summary Cards */}
      <div>
        <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-3 gap-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Leave Taken (Logged Days)
          </h3>
          <span className="text-[11px] text-neutral-400">
            Recorded year-to-date
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {TRACKING_LEAVE_TYPES.map((type) => {
            const cfg = getLeaveTypeConfig(type);
            const daysTaken = used[type] || 0;

            return (
              <div key={type} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-700">{cfg.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cfg.bgClass}`}>
                    {daysTaken} {daysTaken === 1 ? 'Day' : 'Days'} Tracked
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 text-2xl font-bold text-neutral-900 mb-2">
                  <span>{daysTaken}</span>
                  <span className="text-xs font-normal text-neutral-400">
                    {daysTaken === 1 ? 'day logged' : 'days logged'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  {daysTaken} days recorded in calendar this year
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Scheduled Leave History */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Header & Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">My Scheduled Leave History</h3>
            <p className="text-xs text-neutral-500">
              {memberRequests.length} total entries &bull; Directly active on team calendar
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({memberRequests.length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              On Calendar ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'cancelled'
                  ? 'bg-white text-neutral-800 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-neutral-200">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-neutral-50/50">
              <CalendarCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-700">No requests found</p>
              <p className="text-xs text-neutral-500 mt-1">
                There are no leave requests matching the selected &ldquo;{statusFilter}&rdquo; status filter.
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const cfg = getLeaveTypeConfig(req.leaveType);

              return (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 hover:bg-neutral-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${cfg.bgClass}`}
                      >
                        {cfg.label}
                      </span>
                      {req.isOutOfIsland && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                          <Plane className="w-3 h-3 text-sky-600" />
                          <span>Out of Island</span>
                        </span>
                      )}
                      <span className="text-xs font-bold text-neutral-900">
                        {formatDateRange(req.startDate, req.endDate, req.durationType)}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {req.daysCount} {req.daysCount === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700">
                      <span className="font-medium text-neutral-500">Reason:</span> &ldquo;{req.reason}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-400 pt-0.5">
                      <span>Submitted on {formatReadableDate(req.submittedAt.split('T')[0])}</span>
                      {req.reviewedBy && (
                        <span>
                          &bull; Reviewed by {req.reviewedBy} on{' '}
                          {formatReadableDate(req.reviewedAt?.split('T')[0] || '')}
                        </span>
                      )}
                    </div>

                    {req.reviewNote && (
                      <div className="text-xs p-2.5 rounded-lg bg-neutral-100/80 text-neutral-700 border border-neutral-200 mt-2">
                        <span className="font-semibold text-neutral-900">Reviewer Note:</span>{' '}
                        {req.reviewNote}
                      </div>
                    )}
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          Pending Review
                        </span>
                        <button
                          onClick={() => cancelRequest(req.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-neutral-200"
                          title="Cancel this request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {req.status === 'approved' && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          On Calendar
                        </span>
                        <button
                          onClick={() => cancelRequest(req.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-neutral-200"
                          title="Remove this leave from calendar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {req.status === 'rejected' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Rejected
                      </span>
                    )}

                    {req.status === 'cancelled' && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
