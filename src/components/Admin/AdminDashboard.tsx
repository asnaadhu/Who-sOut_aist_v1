import React, { useState, useMemo } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { getLeaveTypeConfig } from '../../data/seedData';
import {
  formatDateRange,
  formatReadableDate,
  formatISODate,
} from '../../utils/dateUtils';
import { Department, LeaveType, TeamMember, UserRole } from '../../types';
import {
  Shield,
  Users,
  Calendar,
  Download,
  UserPlus,
  BarChart3,
  Search,
  Filter,
  Trash2,
  Edit3,
  Plane,
  UserCheck,
  User,
  CheckCircle2,
  FileSpreadsheet,
  CalendarDays,
  Printer,
  Sparkles,
} from 'lucide-react';
import { AddMemberModal } from './AddMemberModal';
import { EditMemberModal } from './EditMemberModal';

const ALL_LEAVE_TYPES: LeaveType[] = ['AL', 'RR', 'SL', 'DO', 'PH', 'FRL', 'BT'];

export const AdminDashboard: React.FC = () => {
  const {
    members,
    requests,
    activeMember,
    deleteRequest,
    deleteMember,
    updateMemberRole,
    getMemberUsedDays,
    setCurrentView,
  } = useCalendar();

  // The 2 options requested: 'user-management' and 'leave-taken-report'
  const [activeTab, setActiveTab] = useState<'user-management' | 'leave-taken-report'>('user-management');

  const availableDepartments = Array.from(
    new Set(['Engineering', 'Product', 'Design', 'Marketing', 'Operations', ...members.map((m) => m.department)])
  ).filter(Boolean);

  // Modal states
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // User Management filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'requestor'>('all');
  const [userDeptFilter, setUserDeptFilter] = useState<string>('all');

  // Leave Taken Report filters
  const [reportSearch, setReportSearch] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [reportPeriodFilter, setReportPeriodFilter] = useState<'all' | 'this-month' | 'upcoming' | 'past'>('all');
  const [reportOutOfIslandOnly, setReportOutOfIslandOnly] = useState(false);

  const todayStr = formatISODate(new Date());
  const currentMonthPrefix = todayStr.substring(0, 7); // e.g. '2026-09'

  // Filtered members for User Management
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (userRoleFilter !== 'all' && m.role !== userRoleFilter) return false;
      if (userDeptFilter !== 'all' && m.department !== userDeptFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchEmail = m.email.toLowerCase().includes(q);
        const matchTitle = m.jobTitle.toLowerCase().includes(q);
        const matchDept = m.department.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTitle && !matchDept) return false;
      }
      return true;
    });
  }, [members, userRoleFilter, userDeptFilter, userSearch]);

  // Counts of users
  const adminCount = useMemo(() => members.filter((m) => m.role === 'admin').length, [members]);
  const requestorCount = useMemo(() => members.filter((m) => m.role === 'requestor').length, [members]);

  // Filtered requests for Leave Taken Report
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Exclude cancelled requests
      if (req.status === 'cancelled') return false;

      // Department filter
      if (reportDeptFilter !== 'all' && req.department !== reportDeptFilter) return false;

      // Leave Type filter
      if (reportTypeFilter !== 'all' && req.leaveType !== reportTypeFilter) return false;

      // Out of island filter
      if (reportOutOfIslandOnly && !req.isOutOfIsland) return false;

      // Period filter
      if (reportPeriodFilter === 'this-month') {
        const inThisMonth = req.startDate.startsWith(currentMonthPrefix) || req.endDate.startsWith(currentMonthPrefix);
        if (!inThisMonth) return false;
      } else if (reportPeriodFilter === 'upcoming') {
        if (req.endDate < todayStr) return false;
      } else if (reportPeriodFilter === 'past') {
        if (req.startDate >= todayStr) return false;
      }

      // Search keyword
      if (reportSearch.trim()) {
        const q = reportSearch.toLowerCase();
        const matchMember = req.memberName.toLowerCase().includes(q);
        const matchReason = (req.reason || '').toLowerCase().includes(q);
        const matchDept = req.department.toLowerCase().includes(q);
        if (!matchMember && !matchReason && !matchDept) return false;
      }

      return true;
    });
  }, [
    requests,
    reportDeptFilter,
    reportTypeFilter,
    reportOutOfIslandOnly,
    reportPeriodFilter,
    reportSearch,
    currentMonthPrefix,
    todayStr,
  ]);

  // Summary statistics for Leave Taken Report
  const reportMetrics = useMemo(() => {
    let totalDays = 0;
    const typeDays: Record<LeaveType, number> = {
      AL: 0,
      RR: 0,
      SL: 0,
      DO: 0,
      PH: 0,
      FRL: 0,
      BT: 0,
    };
    let outOfIslandCount = 0;

    filteredRequests.forEach((r) => {
      totalDays += r.daysCount;
      if (typeDays[r.leaveType] !== undefined) {
        typeDays[r.leaveType] += r.daysCount;
      }
      if (r.isOutOfIsland) {
        outOfIslandCount += 1;
      }
    });

    return {
      totalRecords: filteredRequests.length,
      totalDays,
      typeDays,
      outOfIslandCount,
    };
  }, [filteredRequests]);

  // Export CSV of Leave Taken Report
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Team Member',
      'Role',
      'Department',
      'Leave Type',
      'Out of Island',
      'Start Date',
      'End Date',
      'Working Days',
      'Duration Type',
      'Reason / Note',
      'Date Submitted',
    ];

    const rows = filteredRequests.map((r) => {
      const member = members.find((m) => m.id === r.memberId);
      const memberRole = member?.role === 'admin' ? 'Admin' : 'Requestor';
      return [
        r.id,
        `"${r.memberName.replace(/"/g, '""')}"`,
        memberRole,
        r.department,
        r.leaveType,
        r.isOutOfIsland ? 'Yes' : 'No',
        r.startDate,
        r.endDate,
        r.daysCount,
        r.durationType || 'full',
        `"${(r.reason || '').replace(/"/g, '""')}"`,
        r.submittedAt ? r.submittedAt.split('T')[0] : '',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leave-taken-report-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete User handler with confirmation
  const handleDeleteMember = (member: TeamMember) => {
    if (member.id === activeMember.id) {
      alert('You cannot delete your own currently active account.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${member.name}" (${member.email})? This will also remove all scheduled leave requests for this user.`
    );
    if (confirmed) {
      deleteMember(member.id);
    }
  };

  // Delete Leave Request handler for Admin
  const handleDeleteRequest = (reqId: string, memberName: string) => {
    const confirmed = window.confirm(`Remove leave entry for ${memberName}?`);
    if (confirmed) {
      deleteRequest(reqId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Portal Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100/80 p-4 sm:p-6 shadow-sm shadow-teal-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-teal-700 to-teal-900 text-white shrink-0 shadow-sm">
              <Shield className="w-4 h-4 text-amber-300" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Admin Portal</h2>
            <span className="text-[11px] font-bold bg-gradient-to-r from-teal-700 to-teal-900 text-white px-2 py-0.5 rounded-full">
              Full Access
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage user roles and permissions &bull; Audit company-wide leave taken reports
          </p>
        </div>

        {/* Action button corresponding to active view */}
        <div className="flex items-center gap-2">
          {activeTab === 'user-management' ? (
            <button
              id="admin-create-user-btn"
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 rounded-xl transition-all shadow-sm min-h-[38px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          ) : (
            <button
              id="admin-export-report-btn"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 rounded-xl transition-all shadow-sm min-h-[38px]"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          )}
        </div>
      </div>

      {/* 2 Main Options in Admin Portal */}
      <div className="bg-teal-50/60 p-1.5 rounded-2xl border border-teal-100/80 flex items-center gap-1">
        <button
          id="admin-tab-user-management"
          onClick={() => setActiveTab('user-management')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'user-management'
              ? 'bg-white text-teal-900 shadow-sm border border-teal-100'
              : 'text-neutral-600 hover:text-teal-900 hover:bg-teal-100/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'user-management'
                ? 'bg-teal-800 text-white'
                : 'bg-teal-100 text-teal-700'
            }`}
          >
            {members.length} Users
          </span>
        </button>

        <button
          id="admin-tab-leave-report"
          onClick={() => setActiveTab('leave-taken-report')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'leave-taken-report'
              ? 'bg-white text-teal-900 shadow-sm border border-teal-100'
              : 'text-neutral-600 hover:text-teal-900 hover:bg-teal-100/50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Leave Taken Report</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'leave-taken-report'
                ? 'bg-teal-800 text-white'
                : 'bg-teal-100 text-teal-700'
            }`}
          >
            {requests.filter((r) => r.status !== 'cancelled').length} Records
          </span>
        </button>
      </div>

      {/* ========================================================
          OPTION 1: USER MANAGEMENT
          ======================================================== */}
      {activeTab === 'user-management' && (
        <div className="space-y-4">
          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
              <span className="text-xs font-medium text-neutral-500">Total Registered Users</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-neutral-900">{members.length}</span>
                <span className="text-xs text-neutral-400">across {availableDepartments.length} teams</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Admins</span>
                <span className="text-[10px] font-bold bg-gradient-to-r from-teal-700 to-teal-900 text-white px-2 py-0.2 rounded-full">
                  Full Control
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-neutral-900">{adminCount}</span>
                <span className="text-xs text-neutral-500">can create users &amp; view reports</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Requestors</span>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.2 rounded-full">
                  Standard Role
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-teal-600">{requestorCount}</span>
                <span className="text-xs text-neutral-500">can add/delete only their own leave</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, department or title..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/60 focus:bg-white text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-neutral-500 shrink-0">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="text-xs border border-neutral-200 rounded-xl px-2.5 py-2 bg-neutral-50/60 font-medium text-neutral-800 w-full sm:w-auto"
              >
                <option value="all">All Roles ({members.length})</option>
                <option value="admin">Admins ({adminCount})</option>
                <option value="requestor">Requestors ({requestorCount})</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-neutral-500 shrink-0">Team:</span>
              <select
                value={userDeptFilter}
                onChange={(e) => setUserDeptFilter(e.target.value)}
                className="text-xs border border-neutral-200 rounded-xl px-2.5 py-2 bg-neutral-50/60 font-medium text-neutral-800 w-full sm:w-auto"
              >
                <option value="all">All Departments</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User List Table (Desktop) & Cards (Mobile) */}
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-xs">
              <Users className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">No users found</p>
              <p className="text-xs text-neutral-500 mt-1">Try clearing filters or search terms.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">User &amp; TM ID</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department &amp; Position</th>
                      <th className="py-3 px-4">Leave Taken (2026)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredMembers.map((member) => {
                      const used = getMemberUsedDays(member.id);
                      const isCurrentActive = member.id === activeMember.id;
                      const isAdmin = member.role === 'admin';
                      const displayTmId = member.tmId || member.id.replace('mem-', 'TM-');

                      return (
                        <tr key={member.id} className="hover:bg-neutral-50/60 transition-colors">
                          {/* User Avatar + Name + TM ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 min-w-max">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs ${member.avatarColor}`}
                              >
                                {member.avatarInitials}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-neutral-900">{member.name}</span>
                                  <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200" title="Team Member ID">
                                    {displayTmId}
                                  </span>
                                  <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200/80 font-medium" title="Member Sign-In PIN">
                                    PIN: {member.pin || '123456'}
                                  </span>
                                  {isCurrentActive && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-500">{member.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Selector / Toggle */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={member.role}
                                onChange={(e) => updateMemberRole(member.id, e.target.value as UserRole)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                  isAdmin
                                    ? 'bg-gradient-to-r from-teal-700 to-teal-900 text-white border-teal-800 shadow-sm'
                                    : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                                }`}
                                title="Change role between Admin and Requestor"
                              >
                                <option value="requestor" className="bg-white text-neutral-900 font-medium">
                                  Requestor
                                </option>
                                <option value="admin" className="bg-white text-neutral-900 font-medium">
                                  Admin
                                </option>
                              </select>
                              <span className="text-[10px] text-neutral-400 hidden xl:inline">
                                {isAdmin ? 'Can access admin portal' : 'Only own leave'}
                              </span>
                            </div>
                          </td>

                          {/* Department & Title */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="inline-block text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                                {member.department}
                              </span>
                              <p className="text-[11px] text-neutral-500 truncate max-w-xs">
                                {member.jobTitle}
                              </p>
                            </div>
                          </td>

                          {/* Leave Taken Summary */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-900 text-xs">
                                  {used.total} Days
                                </span>
                                <span className="text-[10px] text-neutral-400">logged</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {used.AL > 0 && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-medium px-1.5 py-0.2 rounded border border-emerald-200">
                                    AL: {used.AL}d
                                  </span>
                                )}
                                {used.RR > 0 && (
                                  <span className="text-[10px] bg-sky-50 text-sky-800 font-medium px-1.5 py-0.2 rounded border border-sky-200">
                                    RR: {used.RR}d
                                  </span>
                                )}
                                {used.SL > 0 && (
                                  <span className="text-[10px] bg-rose-50 text-rose-800 font-medium px-1.5 py-0.2 rounded border border-rose-200">
                                    SL: {used.SL}d
                                  </span>
                                )}
                                {used.DO > 0 && (
                                  <span className="text-[10px] bg-neutral-100 text-neutral-800 font-medium px-1.5 py-0.2 rounded border border-neutral-200">
                                    DO: {used.DO}d
                                  </span>
                                )}
                                {used.BT > 0 && (
                                  <span className="text-[10px] bg-sky-50 text-sky-800 font-medium px-1.5 py-0.2 rounded border border-sky-200">
                                    BT: {used.BT}d
                                  </span>
                                )}
                                {used.total === 0 && (
                                  <span className="text-[10px] text-neutral-400 italic">
                                    0 days taken
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1.5 text-neutral-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Edit user profile & credentials"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                disabled={isCurrentActive}
                                onClick={() => handleDeleteMember(member)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isCurrentActive
                                    ? 'text-neutral-300 cursor-not-allowed'
                                    : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                                }`}
                                title={
                                  isCurrentActive
                                    ? 'Cannot delete your own active account'
                                    : 'Delete user'
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          OPTION 2: LEAVE TAKEN REPORT
          ======================================================== */}
      {activeTab === 'leave-taken-report' && (
        <div className="space-y-4">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2">
            {/* Total Days */}
            <div className="col-span-2 bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Total Days Taken
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-extrabold text-neutral-900">
                  {reportMetrics.totalDays}
                </span>
                <span className="text-xs text-neutral-500 font-medium">days</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {reportMetrics.totalRecords} leave records
              </p>
            </div>

            {/* AL */}
            <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-700">Annual (AL)</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {reportMetrics.typeDays.AL}d
              </p>
            </div>

            {/* RR */}
            <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-700">Rest (RR)</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {reportMetrics.typeDays.RR}d
              </p>
            </div>

            {/* SL */}
            <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-700">Sick (SL)</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {reportMetrics.typeDays.SL}d
              </p>
            </div>

            {/* DO */}
            <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-sky-700">Day Off (DO)</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {reportMetrics.typeDays.DO}d
              </p>
            </div>

            {/* PH */}
            <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-cyan-700">Holiday (PH)</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {reportMetrics.typeDays.PH}d
              </p>
            </div>

            {/* BT */}
            <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-sky-700">Biz Trip (BT)</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {reportMetrics.typeDays.BT}d
              </p>
            </div>

            {/* Out of Island Trips */}
            <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-sky-700 flex items-center gap-1">
                <Plane className="w-3 h-3 text-sky-600" />
                <span>Travel</span>
              </span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {reportMetrics.outOfIslandCount}
              </p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-xs flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Search report by member, note, or department..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/60 focus:bg-white text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            {/* Department Filter */}
            <select
              value={reportDeptFilter}
              onChange={(e) => setReportDeptFilter(e.target.value)}
              className="text-xs border border-neutral-200 rounded-xl px-2.5 py-2 bg-neutral-50/60 font-medium text-neutral-800"
            >
              <option value="all">All Teams</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Leave Type Filter */}
            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="text-xs border border-neutral-200 rounded-xl px-2.5 py-2 bg-neutral-50/60 font-medium text-neutral-800"
            >
              <option value="all">All Leave Types</option>
              {ALL_LEAVE_TYPES.map((t) => {
                const cfg = getLeaveTypeConfig(t);
                return (
                  <option key={t} value={t}>
                    {cfg.label} ({t})
                  </option>
                );
              })}
            </select>

            {/* Period Filter */}
            <select
              value={reportPeriodFilter}
              onChange={(e) => setReportPeriodFilter(e.target.value as any)}
              className="text-xs border border-neutral-200 rounded-xl px-2.5 py-2 bg-neutral-50/60 font-medium text-neutral-800"
            >
              <option value="all">All Time</option>
              <option value="this-month">This Month (Sept 2026)</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>

            {/* Out of island toggle */}
            <button
              onClick={() => setReportOutOfIslandOnly(!reportOutOfIslandOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                reportOutOfIslandOnly
                  ? 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-300'
                  : 'bg-neutral-50/60 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-sky-600" />
              <span>Out of Island Only</span>
            </button>
          </div>

          {/* Report Data Table */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-xs">
              <FileSpreadsheet className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">No leave records match these filters</p>
              <p className="text-xs text-neutral-500 mt-1">Try broadening your search or date criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Travel Status</th>
                      <th className="py-3 px-4">Dates &amp; Duration</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4">Logged On</th>
                      <th className="py-3 px-4 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredRequests.map((req) => {
                      const cfg = getLeaveTypeConfig(req.leaveType);
                      const member = members.find((m) => m.id === req.memberId);
                      const memberRole = member?.role === 'admin' ? 'Admin' : 'Requestor';

                      return (
                        <tr key={req.id} className="hover:bg-neutral-50/60 transition-colors">
                          {/* Member Info + Role */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5 min-w-max">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${req.memberAvatarColor}`}
                              >
                                {req.memberName
                                  .split(' ')
                                  .map((p) => p[0])
                                  .join('')}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-neutral-900">{req.memberName}</span>
                                  {member?.tmId && (
                                    <span className="text-[9px] font-mono font-bold bg-neutral-100 text-neutral-600 px-1 py-0.2 rounded border border-neutral-200">
                                      {member.tmId}
                                    </span>
                                  )}
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                      memberRole === 'Admin'
                                        ? 'bg-gradient-to-r from-teal-700 to-teal-900 text-white'
                                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                                    }`}
                                  >
                                    {memberRole}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-400">{req.department}</p>
                              </div>
                            </div>
                          </td>

                          {/* Leave Type Pill */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${cfg.bgClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                              <span>{cfg.label}</span>
                            </span>
                          </td>

                          {/* Travel / Out of island */}
                          <td className="py-3.5 px-4">
                            {req.isOutOfIsland ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                                <Plane className="w-3 h-3 text-sky-600" />
                                <span>Out of Island</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-400 font-medium">Local</span>
                            )}
                          </td>

                          {/* Dates & Duration */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-neutral-900 text-xs">
                              {formatDateRange(req.startDate, req.endDate)}
                            </p>
                            <span className="text-[10px] text-neutral-400 capitalize">
                              {req.durationType || 'Full Day'}
                            </span>
                          </td>

                          {/* Days Count */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-xs">
                              {req.daysCount} {req.daysCount === 1 ? 'day' : 'days'}
                            </span>
                          </td>

                          {/* Reason / Notes */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-xs text-neutral-600 truncate italic" title={req.reason}>
                              &ldquo;{req.reason || 'No specific note provided'}&rdquo;
                            </p>
                          </td>

                          {/* Logged On */}
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] text-neutral-500 font-mono">
                              {req.submittedAt ? req.submittedAt.split('T')[0] : 'Pre-loaded'}
                            </span>
                          </td>

                          {/* Admin Action: Delete Record */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteRequest(req.id, req.memberName)}
                              className="text-[11px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 transition-colors"
                              title="Delete this leave record from system"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />

      {/* Edit User Modal */}
      <EditMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
      />
    </div>
  );
};
