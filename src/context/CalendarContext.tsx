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
  INITIAL_HOLIDAYS,
} from '../data/seedData';
import { formatISODate, doesRequestCoverDate } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import {
  DbTeamMember,
  DbTimeOffRequest,
  dbMemberToApp,
  appMemberToDb,
  dbRequestToApp,
  dbHolidayToApp,
} from '../lib/dbMapping';
import { getInitials } from '../data/avatars';

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
  currentMonth: number;
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
  isAuthenticated: boolean;
  mustChangePin: boolean;
  login: (tmId: string, pin: string) => { success: boolean; error?: string };
  changePin: (newPin: string) => { success: boolean; error?: string };
  logout: () => void;
  loading: boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const STORAGE_KEY_ACTIVE_USER = 'team_calendar_active_user_v4';
const STORAGE_KEY_AUTH = 'team_calendar_auth_v4';

const sortByDepartment = (a: TeamMember, b: TeamMember) =>
  a.department.localeCompare(b.department) || a.name.localeCompare(b.name);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>(INITIAL_HOLIDAYS);
  const [loading, setLoading] = useState(true);

  const [activeMemberId, setActiveMemberIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      return saved || 'mem-asnad';
    } catch {
      return 'mem-asnad';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [mustChangePin, setMustChangePin] = useState<boolean>(false);

  // ─── Load from Supabase on mount ───────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [membersRes, requestsRes, holidaysRes] = await Promise.all([
          supabase.from('team_members').select('*'),
          supabase.from('time_off_requests').select('*'),
          supabase.from('public_holidays').select('*'),
        ]);

        if (cancelled) return;

        if (membersRes.error) console.error('Failed to load members:', membersRes.error);
        if (requestsRes.error) console.error('Failed to load requests:', requestsRes.error);
        if (holidaysRes.error) console.error('Failed to load holidays:', holidaysRes.error);

        if (membersRes.data) {
          setMembers((membersRes.data as DbTeamMember[]).map(dbMemberToApp).sort(sortByDepartment));
        }
        if (requestsRes.data) {
          setRequests((requestsRes.data as DbTimeOffRequest[]).map(dbRequestToApp));
        }
        if (holidaysRes.data && holidaysRes.data.length > 0) {
          setHolidays(holidaysRes.data.map(dbHolidayToApp));
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  // ─── Realtime subscriptions ───────────────────────────────
  // Whenever any row in our tables changes (insert/update/delete), re-fetch
  // that table so every connected user sees the change instantly.
  useEffect(() => {
    const channel = supabase
      .channel('team-calendar-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' },
        () => {
          supabase.from('team_members').select('*')
            .then(({ data, error }) => {
              if (error) { console.error('Realtime: failed to reload members:', error); return; }
              if (data) setMembers((data as DbTeamMember[]).map(dbMemberToApp).sort(sortByDepartment));
            });
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_off_requests' },
        () => {
          supabase.from('time_off_requests').select('*')
            .then(({ data, error }) => {
              if (error) { console.error('Realtime: failed to reload requests:', error); return; }
              if (data) setRequests((data as DbTimeOffRequest[]).map(dbRequestToApp));
            });
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'public_holidays' },
        () => {
          supabase.from('public_holidays').select('*')
            .then(({ data, error }) => {
              if (error) { console.error('Realtime: failed to reload holidays:', error); return; }
              if (data && data.length > 0) setHolidays(data.map(dbHolidayToApp));
            });
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Auth ──────────────────────────────────────────────────
  const login = (tmIdInput: string, pinInput: string): { success: boolean; error?: string } => {
    const cleanTmId = tmIdInput.trim().toUpperCase();
    const cleanPin = pinInput.trim();

    if (!cleanTmId) return { success: false, error: 'Please enter your TM ID (e.g. TM-001).' };
    if (!cleanPin) return { success: false, error: 'Please enter your 6-digit PIN.' };
    if (!/^\d{6}$/.test(cleanPin)) return { success: false, error: 'PIN must be exactly 6 digits (numbers only).' };

    const matchedMember = members.find(
      (m) =>
        (m.tmId && m.tmId.toUpperCase() === cleanTmId) ||
        m.id.toUpperCase() === cleanTmId ||
        m.id.toUpperCase() === `MEM-${cleanTmId}`
    );

    if (!matchedMember) return { success: false, error: `No registered team member found with TM ID "${cleanTmId}".` };

    if (cleanPin !== (matchedMember.pin || '123456')) {
      return { success: false, error: 'Incorrect 6-digit PIN. Please verify and try again.' };
    }

    setActiveMemberIdState(matchedMember.id);
    setIsAuthenticated(true);
    setMustChangePin(!matchedMember.pinChanged);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, matchedMember.id);
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  };

  const changePin = (newPin: string): { success: boolean; error?: string } => {
    if (!/^\d{6}$/.test(newPin)) return { success: false, error: 'PIN must be exactly 6 digits (numbers only).' };

    const currentPin = activeMember.pin || '123456';
    if (newPin === currentPin) return { success: false, error: 'Your new PIN must be different from the current one.' };

    setMembers((prev) => prev.map((m) => m.id === activeMember.id ? { ...m, pin: newPin, pinChanged: true } : m));
    setMustChangePin(false);

    supabase.from('team_members').update({ pin: newPin, pin_changed: true }).eq('id', activeMember.id)
      .then(({ error }) => { if (error) console.error('Failed to update PIN:', error); });

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMustChangePin(false);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'false');
    } catch (e) {
      console.error(e);
    }
  };

  // ─── View state ────────────────────────────────────────────
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, activeMemberId);
    } catch (e) {
      console.error(e);
    }
  }, [activeMemberId]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('All');
  const [calendarMode, setCalendarModeState] = useState<CalendarViewMode>('week');
  const [focusedDate, setFocusedDateState] = useState<Date>(() => new Date());
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
    if (mode === 'week') setFocusedDate(new Date());
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestInitialDate, setRequestInitialDate] = useState<string | null>(null);

  const openAddLeaveModal = (initialDate?: string) => {
    setRequestInitialDate(initialDate || null);
    setIsRequestModalOpen(true);
  };

  // ─── Derived ───────────────────────────────────────────────
  const activeMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0] || {} as TeamMember;
  }, [members, activeMemberId]);

  const isAdmin = activeMember.role === 'admin';

  const pendingRequestsCount = useMemo(() => {
    return requests.filter((r) => r.status === 'pending').length;
  }, [requests]);

  // ─── Navigation ────────────────────────────────────────────
  const goToPrevious = () => {
    if (calendarMode === 'week') {
      const today = new Date();
      const todayStr = formatISODate(today);
      const prev = new Date(focusedDate);
      prev.setDate(prev.getDate() - 7);
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

  const goToToday = () => setFocusedDate(new Date());

  // ─── Computed helpers ──────────────────────────────────────
  const getMemberUsedDays = (memberId: string): Record<LeaveType, number> & { total: number } => {
    const approvedRequests = requests.filter(
      (r) => r.memberId === memberId && r.status === 'approved'
    );
    const summary: Record<LeaveType, number> & { total: number } = {
      DO: 0, PH: 0, AL: 0, RR: 0, SL: 0, FRL: 0, BT: 0, total: 0,
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

  // ─── Mutations ─────────────────────────────────────────────
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
    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newReq: TimeOffRequest = {
      id,
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
      submittedAt: now,
    };

    setRequests((prev) => [newReq, ...prev]);
    setIsRequestModalOpen(false);

    supabase.from('time_off_requests').insert({
      id,
      member_id: member.id,
      member_name: member.name,
      member_avatar_color: member.avatarColor,
      department: member.department,
      leave_type: data.leaveType,
      is_out_of_island: !!data.isOutOfIsland,
      start_date: data.startDate,
      end_date: data.endDate,
      duration_type: data.durationType,
      days_count: data.daysCount,
      reason: data.reason.trim() || 'No specific note provided',
      status: 'approved',
      submitted_at: now,
    }).then(({ error }) => {
      if (error) console.error('Failed to save request to DB:', error);
    });
  };

  const cancelRequest = (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;
    if (activeMember.role !== 'admin' && target.memberId !== activeMember.id) {
      console.warn('Unauthorized: You can only delete your own leave.');
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    supabase.from('time_off_requests').delete().eq('id', requestId)
      .then(({ error }) => { if (error) console.error('Failed to delete request:', error); });
  };

  const deleteRequest = (requestId: string) => cancelRequest(requestId);

  const reviewRequest = (
    requestId: string,
    status: 'approved' | 'rejected',
    reviewNote?: string
  ) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => r.id === requestId ? {
        ...r, status, reviewedAt: now, reviewedBy: activeMember.name,
        reviewNote: reviewNote || (status === 'approved' ? 'Approved by Admin' : 'Declined'),
      } : r)
    );
    supabase.from('time_off_requests').update({
      status, reviewed_at: now, reviewed_by: activeMember.name,
      review_note: reviewNote || (status === 'approved' ? 'Approved by Admin' : 'Declined'),
    }).eq('id', requestId)
      .then(({ error }) => { if (error) console.error('Failed to review request:', error); });
  };

  const bulkReviewRequests = (requestIds: string[], status: 'approved' | 'rejected') => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => requestIds.includes(r.id) && r.status === 'pending' ? {
        ...r, status, reviewedAt: now, reviewedBy: activeMember.name,
        reviewNote: status === 'approved' ? 'Batch approved by Admin' : 'Batch declined',
      } : r)
    );
    supabase.from('time_off_requests').update({
      status, reviewed_at: now, reviewed_by: activeMember.name,
      review_note: status === 'approved' ? 'Batch approved by Admin' : 'Batch declined',
    }).in('id', requestIds)
      .then(({ error }) => { if (error) console.error('Failed to bulk review:', error); });
  };

  // ─── Member mutations ──────────────────────────────────────
  const addTeamMember = (
    data: Partial<TeamMember> & { name: string; department: Department; jobTitle: string; tmId?: string }
  ) => {
    const initials = getInitials(data.name);
    const assignedTmId =
      data.tmId && data.tmId.trim()
        ? data.tmId.trim().toUpperCase()
        : `TM-${String(members.length + 1).padStart(3, '0')}`;

    const cleanEmail =
      data.email && data.email.trim()
        ? data.email.trim()
        : `${data.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@acme.inc`;

    const avatarPalette = [
      'bg-[#14213D] text-white', 'bg-[#FCA311] text-[#14213D]', 'bg-[#000000] text-white',
      'bg-[#E4E4E4] text-[#14213D]', 'bg-white text-[#14213D] border border-[#14213D]',
      'bg-[#FCA311] text-[#14213D] border border-[#14213D]',
    ];
    const pickedAvatar = data.avatarColor || avatarPalette[members.length % avatarPalette.length];

    const cleanPin = data.pin && /^\d{6}$/.test(data.pin.trim()) ? data.pin.trim() : '123456';
    const id = `mem-${Date.now()}`;

    const newMember: TeamMember = {
      id,
      tmId: assignedTmId,
      pin: cleanPin,
      name: data.name.trim(),
      email: cleanEmail,
      avatarColor: pickedAvatar,
      avatarInitials: initials,
      role: data.role || 'requestor',
      department: data.department,
      jobTitle: data.jobTitle.trim() || 'Team Member',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      allowances: data.allowances || { AL: 25, RR: 14, SL: 14, DO: 52, PH: 10, FRL: 5, BT: 10 },
      pinChanged: false,
    };

    setMembers((prev) => [...prev, newMember].sort(sortByDepartment));

    supabase.from('team_members').insert({
      id,
      tm_id: assignedTmId,
      pin: cleanPin,
      pin_changed: false,
      name: newMember.name,
      email: cleanEmail,
      avatar_color: pickedAvatar,
      avatar_initials: initials,
      role: newMember.role,
      department: newMember.department,
      job_title: newMember.jobTitle,
      joined_date: newMember.joinedDate,
      allowances: newMember.allowances,
    }).then(({ error }) => { if (error) console.error('Failed to save member:', error); });
  };

  const updateMemberRole = (memberId: string, role: UserRole) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m));
    supabase.from('team_members').update({ role }).eq('id', memberId)
      .then(({ error }) => { if (error) console.error('Failed to update role:', error); });
  };

  const updateMember = (memberId: string, data: Partial<TeamMember>) => {
    const pinChangedByAdmin =
      data.pin !== undefined && /^\d{6}$/.test(data.pin.trim()) &&
      data.pin.trim() !== members.find((m) => m.id === memberId)?.pin;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const updatedPin = data.pin && /^\d{6}$/.test(data.pin.trim()) ? data.pin.trim() : m.pin;
        return {
          ...m,
          ...data,
          pin: updatedPin,
          pinChanged: pinChangedByAdmin ? false : m.pinChanged,
        };
      })
    );
    if (data.avatarColor) {
      setRequests((prev) =>
        prev.map((r) => r.memberId === memberId ? { ...r, memberAvatarColor: data.avatarColor! } : r)
      );
      supabase.from('time_off_requests').update({ member_avatar_color: data.avatarColor })
        .eq('member_id', memberId)
        .then(({ error }) => { if (error) console.error('Failed to sync avatar on requests:', error); });
    }
    const dbData = appMemberToDb({
      ...(data as Partial<TeamMember> & { name: string; department: string; jobTitle: string }),
      pinChanged: pinChangedByAdmin ? false : undefined,
    });
    supabase.from('team_members').update(dbData).eq('id', memberId)
      .then(({ error }) => { if (error) console.error('Failed to update member:', error); });
  };

  const deleteMember = (memberId: string) => {
    if (activeMember.id === memberId) {
      alert('You cannot delete your own currently logged-in account.');
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setRequests((prev) => prev.filter((r) => r.memberId !== memberId));
    supabase.from('team_members').delete().eq('id', memberId)
      .then(({ error }) => { if (error) console.error('Failed to delete member:', error); });
  };

  const updateMemberAllowances = (memberId: string, allowances: LeaveAllowance) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, allowances } : m));
    supabase.from('team_members').update({ allowances }).eq('id', memberId)
      .then(({ error }) => { if (error) console.error('Failed to update allowances:', error); });
  };

  return (
    <CalendarContext.Provider
      value={{
        members,
        requests,
        holidays,
        activeMemberId,
        activeMember: activeMember as TeamMember,
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
        isAuthenticated,
        mustChangePin,
        login,
        changePin,
        logout,
        loading,
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
