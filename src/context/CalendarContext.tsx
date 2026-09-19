import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  TeamMember,
  TimeOffRequest,
  PublicHoliday,
  Department,
  LeaveType,
  LeaveAllowance,
  ViewTab,
  CalendarViewMode,
  UserRole,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_REQUESTS,
  INITIAL_HOLIDAYS,
} from '../data/seedData';
import { formatISODate, doesRequestCoverDate } from '../utils/dateUtils';

interface CalendarContextType {
  members: TeamMember[];
  requests: TimeOffRequest[];
  holidays: PublicHoliday[];
  activeMemberId: string;
  activeMember: TeamMember;
  isAdmin: boolean;
  currentView: ViewTab;
  setCurrentView: (view: ViewTab) => void;
  setActiveMemberId: (id: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedLeaveType: string;
  setSelectedLeaveType: (type: string) => void;
  calendarMode: CalendarViewMode;
  setCalendarMode: (mode: CalendarViewMode) => void;
  focusedDate: Date;
  setFocusedDate: (date: Date) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  currentYear: number;
  currentMonth: number; // 0-indexed
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;
  requestInitialDate: string | null;
  openAddLeaveModal: (initialDate?: string) => void;
  submitRequest: (data: {
    memberId: string;
    leaveType: LeaveType;
    isOutOfIsland?: boolean;
    startDate: string;
    endDate: string;
    durationType: 'full' | 'morning' | 'afternoon';
    daysCount: number;
    reason: string;
  }) => void;
  cancelRequest: (requestId: string) => void;
  deleteRequest: (requestId: string) => void;
  reviewRequest: (requestId: string, status: 'approved' | 'rejected', reviewNote?: string) => void;
  bulkReviewRequests: (requestIds: string[], status: 'approved' | 'rejected') => void;
  addTeamMember: (
    member: Partial<TeamMember> & { name: string; department: Department; jobTitle: string; tmId?: string }
  ) => void;
  updateMemberRole: (memberId: string, role: UserRole) => void;
  updateMember: (memberId: string, data: Partial<TeamMember>) => void;
  deleteMember: (memberId: string) => void;
  updateMemberAllowances: (memberId: string, allowances: LeaveAllowance) => void;
  getMemberUsedDays: (memberId: string) => Record<LeaveType, number> & { total: number };
  getRequestsForDate: (dateStr: string) => TimeOffRequest[];
  getDepartmentCoverageWarning: (dateStr: string, department: Department) => {
    isWarning: boolean;
    awayCount: number;
    totalCount: number;
    message: string;
  } | null;
  pendingRequestsCount: number;
  resetToDefaults: () => void;
  isAuthenticated: boolean;
  login: (tmId: string, pin: string) => { success: boolean; error?: string };
  logout: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const STORAGE_KEY_MEMBERS = 'team_calendar_members_v4';
const STORAGE_KEY_REQUESTS = 'team_calendar_requests_v4';
const STORAGE_KEY_ACTIVE_USER = 'team_calendar_active_user_v4';
const STORAGE_KEY_AUTH = 'team_calendar_auth_v4';

// Legacy keys for automatic migration cleanup
const LEGACY_STORAGE_KEY_MEMBERS = 'team_calendar_members_v2';
const LEGACY_STORAGE_KEY_REQUESTS = 'team_calendar_requests_v2';

const normalizeLeaveType = (type: any): LeaveType => {
  const upper = String(type || '').toUpperCase();
  if (upper === 'DO' || upper === 'PH' || upper === 'AL' || upper === 'RR' || upper === 'SL' || upper === 'FRL') {
    return upper as LeaveType;
  }
  if (type === 'vacation') return 'AL';
  if (type === 'sick') return 'SL';
  if (type === 'remote') return 'DO';
  if (type === 'personal') return 'FRL';
  if (type === 'holiday') return 'PH';
  return 'AL';
};

const DUMMY_MEMBER_IDS = new Set([
  'mem-1',
  'mem-2',
  'mem-3',
  'mem-4',
  'mem-5',
  'mem-6',
  'mem-7',
  'mem-8',
]);

const DUMMY_MEMBER_NAMES = new Set([
  'marcus vance',
  'sarah chen',
  'liam johnson',
  'carlos gomez',
  'aisha patel',
  'elena rostova',
  'maya lin',
  'jordan taylor',
]);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Members state: only Asnad and any users created by admin
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (!saved) return INITIAL_MEMBERS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_MEMBERS;

      const filtered = parsed.filter(
        (m: any) =>
          !DUMMY_MEMBER_IDS.has(m.id) &&
          !DUMMY_MEMBER_NAMES.has(String(m.name || '').toLowerCase().trim())
      );

      if (filtered.length === 0) return INITIAL_MEMBERS;

      const loaded: TeamMember[] = filtered.map((m: any, idx: number) => {
        const rawAllow = m.allowances || {};
        const isAsnad =
          m.id === 'mem-asnad' ||
          m.email?.toLowerCase() === 'asnaadhu@gmail.com' ||
          m.name === 'Asnad' ||
          m.name === 'Ahmed Asnad';

        const assignedTmId =
          m.tmId && String(m.tmId).trim()
            ? String(m.tmId).trim().toUpperCase()
            : isAsnad
            ? 'TM-001'
            : `TM-${String(idx + 1).padStart(3, '0')}`;

        const assignedPin =
          m.pin && /^\d{6}$/.test(String(m.pin).trim())
            ? String(m.pin).trim()
            : '123456';

        return {
          ...m,
          name: isAsnad ? 'Asnad' : m.name,
          tmId: assignedTmId,
          pin: assignedPin,
          role: (isAsnad ? 'admin' : m.role === 'admin' ? 'admin' : 'requestor') as UserRole,
          allowances: {
            AL: Number(rawAllow.AL ?? rawAllow.vacation ?? 20),
            RR: Number(rawAllow.RR ?? 14),
            SL: Number(rawAllow.SL ?? rawAllow.sick ?? 10),
            DO: Number(rawAllow.DO ?? 12),
            PH: Number(rawAllow.PH ?? 10),
            FRL: Number(rawAllow.FRL ?? rawAllow.personal ?? 5),
          },
        };
      });

      // Ensure Asnad is always present as an admin user
      const hasAsnad = loaded.some(
        (m) =>
          m.id === 'mem-asnad' ||
          m.email.toLowerCase() === 'asnaadhu@gmail.com' ||
          m.name === 'Asnad' ||
          m.name === 'Ahmed Asnad'
      );
      if (!hasAsnad) {
        return [INITIAL_MEMBERS[0], ...loaded];
      }
      return loaded;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  // Requests state
  const [requests, setRequests] = useState<TimeOffRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (!saved) return INITIAL_REQUESTS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_REQUESTS;

      const filtered = parsed.filter((r: any) => !DUMMY_MEMBER_IDS.has(r.memberId));
      if (filtered.length === 0) return INITIAL_REQUESTS;

      return filtered.map((r: any) => ({
        ...r,
        leaveType: normalizeLeaveType(r.leaveType),
        isOutOfIsland: Boolean(r.isOutOfIsland),
        status: r.status === 'pending' ? ('approved' as const) : r.status,
      }));
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  // Active Member: default to Asnad (admin)
  const [activeMemberId, setActiveMemberIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (saved && !DUMMY_MEMBER_IDS.has(saved)) {
        return saved;
      }
      return 'mem-asnad';
    } catch {
      return 'mem-asnad';
    }
  });

  // Authentication state (TM ID + 6-digit PIN)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });

  const login = (tmIdInput: string, pinInput: string): { success: boolean; error?: string } => {
    const cleanTmId = tmIdInput.trim().toUpperCase();
    const cleanPin = pinInput.trim();

    if (!cleanTmId) {
      return { success: false, error: 'Please enter your TM ID (e.g. TM-001).' };
    }

    if (!cleanPin) {
      return { success: false, error: 'Please enter your 6-digit PIN.' };
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      return { success: false, error: 'PIN must be exactly 6 digits (numbers only).' };
    }

    const matchedMember = members.find(
      (m) =>
        (m.tmId && m.tmId.toUpperCase() === cleanTmId) ||
        m.id.toUpperCase() === cleanTmId ||
        m.id.toUpperCase() === `MEM-${cleanTmId}`
    );

    if (!matchedMember) {
      return { success: false, error: `No registered team member found with TM ID "${cleanTmId}".` };
    }

    const expectedPin = matchedMember.pin || '123456';
    if (cleanPin !== expectedPin) {
      return { success: false, error: 'Incorrect 6-digit PIN. Please verify and try again.' };
    }

    setActiveMemberIdState(matchedMember.id);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, matchedMember.id);
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'false');
    } catch (e) {
      console.error(e);
    }
  };

  // View state
  const [currentView, setCurrentViewState] = useState<ViewTab>('calendar');

  const setCurrentView = (view: ViewTab) => {
    const active = members.find((m) => m.id === activeMemberId) || members[0];
    if (view === 'admin-dashboard' && active?.role !== 'admin') {
      setCurrentViewState('calendar');
      return;
    }
    setCurrentViewState(view);
  };

  const setActiveMemberId = (id: string) => {
    setActiveMemberIdState(id);
    const selected = members.find((m) => m.id === id);
    if (selected && selected.role !== 'admin' && currentView === 'admin-dashboard') {
      setCurrentViewState('calendar');
    }
  };
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('All');

  // Calendar sub-view state: 'week' | 'month' (default 'week')
  const [calendarMode, setCalendarModeState] = useState<CalendarViewMode>('week');

  // Focused date: defaults to present day
  const [focusedDate, setFocusedDateState] = useState<Date>(() => new Date());

  // Month navigation: synchronized with focusedDate
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());

  const setFocusedDate = (d: Date) => {
    setFocusedDateState(d);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  };

  const setCalendarMode = (mode: CalendarViewMode) => {
    setCalendarModeState(mode);
    setSelectedDate(null);
    if (mode === 'week') {
      // In week view, always first present day and show next 6 days
      setFocusedDate(new Date());
    }
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestInitialDate, setRequestInitialDate] = useState<string | null>(null);

  const openAddLeaveModal = (initialDate?: string) => {
    if (initialDate) {
      setRequestInitialDate(initialDate);
    } else {
      setRequestInitialDate(null);
    }
    setIsRequestModalOpen(true);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members', e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save requests', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, activeMemberId);
    } catch (e) {
      console.error('Failed to save active user', e);
    }
  }, [activeMemberId]);

  const activeMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0] || INITIAL_MEMBERS[0];
  }, [members, activeMemberId]);

  const isAdmin = activeMember.role === 'admin';

  const pendingRequestsCount = useMemo(() => {
    return requests.filter((r) => r.status === 'pending').length;
  }, [requests]);

  const goToPrevious = () => {
    if (calendarMode === 'week') {
      const today = new Date();
      const todayStr = formatISODate(today);
      const prev = new Date(focusedDate);
      prev.setDate(prev.getDate() - 7);
      // In week view, past week days are not important - never navigate prior to present day
      if (formatISODate(prev) < todayStr) {
        setFocusedDate(today);
      } else {
        setFocusedDate(prev);
      }
    } else {
      goToPreviousMonth();
    }
  };

  const goToNext = () => {
    if (calendarMode === 'week') {
      const nxt = new Date(focusedDate);
      nxt.setDate(nxt.getDate() + 7);
      setFocusedDate(nxt);
    } else {
      goToNextMonth();
    }
  };

  const goToPreviousMonth = () => {
    const prev = new Date(focusedDate);
    prev.setMonth(prev.getMonth() - 1);
    setFocusedDate(prev);
  };

  const goToNextMonth = () => {
    const nxt = new Date(focusedDate);
    nxt.setMonth(nxt.getMonth() + 1);
    setFocusedDate(nxt);
  };

  const goToToday = () => {
    const today = new Date();
    setFocusedDate(today);
  };

  const getMemberUsedDays = (memberId: string): Record<LeaveType, number> & { total: number } => {
    const approvedRequests = requests.filter(
      (r) => r.memberId === memberId && r.status === 'approved'
    );
    const summary: Record<LeaveType, number> & { total: number } = {
      DO: 0,
      PH: 0,
      AL: 0,
      RR: 0,
      SL: 0,
      FRL: 0,
      total: 0,
    };
    approvedRequests.forEach((req) => {
      if (summary[req.leaveType] !== undefined) {
        summary[req.leaveType] += req.daysCount;
        summary.total += req.daysCount;
      }
    });
    return summary;
  };

  const getRequestsForDate = (dateStr: string): TimeOffRequest[] => {
    return requests.filter((req) => doesRequestCoverDate(req, dateStr));
  };

  const getDepartmentCoverageWarning = (dateStr: string, department: Department) => {
    const deptMembers = members.filter((m) => m.department === department);
    if (deptMembers.length === 0) return null;

    const deptAwayMembers = deptMembers.filter((m) =>
      requests.some(
        (r) =>
          r.memberId === m.id &&
          (r.status === 'approved' || r.status === 'pending') &&
          doesRequestCoverDate(r, dateStr)
      )
    );

    const awayCount = deptAwayMembers.length;
    const totalCount = deptMembers.length;
    const awayRatio = awayCount / totalCount;

    // Warning if 50% or more are away, or if more than 1 are away in a small team
    if (awayCount >= 2 && awayRatio >= 0.4) {
      return {
        isWarning: true,
        awayCount,
        totalCount,
        message: `${awayCount} of ${totalCount} ${department} members off on this date`,
      };
    }
    return null;
  };

  const submitRequest = (data: {
    memberId: string;
    leaveType: LeaveType;
    isOutOfIsland?: boolean;
    startDate: string;
    endDate: string;
    durationType: 'full' | 'morning' | 'afternoon';
    daysCount: number;
    reason: string;
  }) => {
    const member = members.find((m) => m.id === data.memberId) || activeMember;
    const newReq: TimeOffRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      memberId: member.id,
      memberName: member.name,
      memberAvatarColor: member.avatarColor,
      department: member.department,
      leaveType: data.leaveType,
      isOutOfIsland: !!data.isOutOfIsland,
      startDate: data.startDate,
      endDate: data.endDate,
      durationType: data.durationType,
      daysCount: data.daysCount,
      reason: data.reason.trim() || 'No specific note provided',
      status: 'approved',
      submittedAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
    setIsRequestModalOpen(false);
  };

  const cancelRequest = (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;
    // Each requestor can add/delete ONLY their own leave, admin can delete any leave
    if (activeMember.role !== 'admin' && target.memberId !== activeMember.id) {
      console.warn('Unauthorized: You can only delete your own leave.');
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const deleteRequest = (requestId: string) => {
    cancelRequest(requestId);
  };

  const reviewRequest = (
    requestId: string,
    status: 'approved' | 'rejected',
    reviewNote?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            reviewedAt: new Date().toISOString(),
            reviewedBy: activeMember.name,
            reviewNote: reviewNote || (status === 'approved' ? 'Approved by Admin' : 'Declined'),
          };
        }
        return r;
      })
    );
  };

  const bulkReviewRequests = (requestIds: string[], status: 'approved' | 'rejected') => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => {
        if (requestIds.includes(r.id) && r.status === 'pending') {
          return {
            ...r,
            status,
            reviewedAt: now,
            reviewedBy: activeMember.name,
            reviewNote: status === 'approved' ? 'Batch approved by Admin' : 'Batch declined',
          };
        }
        return r;
      })
    );
  };

  const addTeamMember = (
    data: Partial<TeamMember> & { name: string; department: Department; jobTitle: string; tmId?: string }
  ) => {
    const initials = data.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const assignedTmId =
      data.tmId && data.tmId.trim()
        ? data.tmId.trim().toUpperCase()
        : `TM-${String(members.length + 1).padStart(3, '0')}`;

    const cleanEmail =
      data.email && data.email.trim()
        ? data.email.trim()
        : `${data.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@acme.inc`;

    const avatarPalette = [
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-sky-600 text-white',
      'bg-teal-600 text-white',
      'bg-fuchsia-600 text-white',
      'bg-neutral-800 text-white',
    ];
    const pickedAvatar =
      data.avatarColor || avatarPalette[members.length % avatarPalette.length];

    const cleanPin =
      data.pin && /^\d{6}$/.test(data.pin.trim()) ? data.pin.trim() : '123456';

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      tmId: assignedTmId,
      pin: cleanPin,
      name: data.name.trim(),
      email: cleanEmail,
      avatarColor: pickedAvatar,
      avatarInitials: initials || 'TM',
      role: data.role || 'requestor',
      department: data.department,
      jobTitle: data.jobTitle.trim() || 'Team Member',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      allowances: data.allowances || {
        AL: 25,
        RR: 14,
        SL: 14,
        DO: 52,
        PH: 10,
        FRL: 5,
      },
    };

    setMembers((prev) => [...prev, newMember]);
  };

  const updateMemberRole = (memberId: string, role: UserRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role } : m))
    );
  };

  const updateMember = (memberId: string, data: Partial<TeamMember>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const updatedPin =
          data.pin && /^\d{6}$/.test(data.pin.trim()) ? data.pin.trim() : m.pin;
        return {
          ...m,
          ...data,
          pin: updatedPin,
        };
      })
    );
  };

  const deleteMember = (memberId: string) => {
    if (activeMember.id === memberId) {
      alert('You cannot delete your own currently logged-in account.');
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setRequests((prev) => prev.filter((r) => r.memberId !== memberId));
  };

  const updateMemberAllowances = (memberId: string, allowances: LeaveAllowance) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, allowances } : m))
    );
  };

  const resetToDefaults = () => {
    setMembers(INITIAL_MEMBERS);
    setRequests(INITIAL_REQUESTS);
    setActiveMemberId('mem-asnad');
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY_MEMBERS);
      localStorage.removeItem(STORAGE_KEY_REQUESTS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(LEGACY_STORAGE_KEY_MEMBERS);
      localStorage.removeItem(LEGACY_STORAGE_KEY_REQUESTS);
    } catch {
      // ignore
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        members,
        requests,
        holidays: INITIAL_HOLIDAYS,
        activeMemberId,
        activeMember,
        isAdmin,
        currentView,
        setCurrentView,
        setActiveMemberId,
        selectedDepartment,
        setSelectedDepartment,
        selectedLeaveType,
        setSelectedLeaveType,
        calendarMode,
        setCalendarMode,
        focusedDate,
        setFocusedDate,
        goToPrevious,
        goToNext,
        currentYear,
        currentMonth,
        goToPreviousMonth,
        goToNextMonth,
        goToToday,
        selectedDate,
        setSelectedDate,
        isRequestModalOpen,
        setIsRequestModalOpen,
        requestInitialDate,
        openAddLeaveModal,
        submitRequest,
        cancelRequest,
        deleteRequest,
        reviewRequest,
        bulkReviewRequests,
        addTeamMember,
        updateMemberRole,
        updateMember,
        deleteMember,
        updateMemberAllowances,
        getMemberUsedDays,
        getRequestsForDate,
        getDepartmentCoverageWarning,
        pendingRequestsCount,
        resetToDefaults,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
