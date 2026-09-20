import { TeamMember, TimeOffRequest, PublicHoliday, LeaveType, LeaveTypeConfig } from '../types';

const BASE_LEAVE_TYPE_CONFIG: Record<string, LeaveTypeConfig> = {
  DO: {
    label: 'DO (Day Off)',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    badgeBg: 'bg-red-600 text-white',
    dotColor: 'bg-red-600',
    iconName: 'Coffee',
    description: 'Weekly scheduled day off',
  },
  PH: {
    label: 'PH (Public Holiday)',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    badgeBg: 'bg-red-600 text-white',
    dotColor: 'bg-red-600',
    iconName: 'Sparkles',
    description: 'Recognized public holiday leave',
  },
  AL: {
    label: 'AL (Annual Leave)',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    badgeBg: 'bg-red-600 text-white',
    dotColor: 'bg-red-600',
    iconName: 'Palmtree',
    description: 'Annual paid leave & vacation',
  },
  RR: {
    label: 'RR (Rest & Relax)',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    badgeBg: 'bg-red-600 text-white',
    dotColor: 'bg-red-600',
    iconName: 'Plane',
    description: 'Rest & relax cycle break',
  },
  SL: {
    label: 'SL (Sick Leave)',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    badgeBg: 'bg-red-600 text-white',
    dotColor: 'bg-red-600',
    iconName: 'HeartPulse',
    description: 'Medical appointments & illness recovery',
  },
  FRL: {
    label: 'FRL (Family Responsibility)',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    badgeBg: 'bg-red-600 text-white',
    dotColor: 'bg-red-600',
    iconName: 'Users',
    description: 'Emergency family care & compassionate leave',
  },
};

// Aliases for any legacy or alternative stored names
BASE_LEAVE_TYPE_CONFIG.vacation = BASE_LEAVE_TYPE_CONFIG.AL;
BASE_LEAVE_TYPE_CONFIG.sick = BASE_LEAVE_TYPE_CONFIG.SL;
BASE_LEAVE_TYPE_CONFIG.remote = BASE_LEAVE_TYPE_CONFIG.DO;
BASE_LEAVE_TYPE_CONFIG.personal = BASE_LEAVE_TYPE_CONFIG.FRL;
BASE_LEAVE_TYPE_CONFIG.holiday = BASE_LEAVE_TYPE_CONFIG.PH;
BASE_LEAVE_TYPE_CONFIG.unpaid = BASE_LEAVE_TYPE_CONFIG.DO;

export const getLeaveTypeConfig = (type?: string | null): LeaveTypeConfig => {
  if (!type) return BASE_LEAVE_TYPE_CONFIG.AL;
  const upper = String(type).toUpperCase();
  if (BASE_LEAVE_TYPE_CONFIG[upper]) return BASE_LEAVE_TYPE_CONFIG[upper];
  if (BASE_LEAVE_TYPE_CONFIG[type]) return BASE_LEAVE_TYPE_CONFIG[type];
  return BASE_LEAVE_TYPE_CONFIG.AL;
};

export const LEAVE_TYPE_CONFIG: Record<LeaveType, LeaveTypeConfig> = new Proxy(
  BASE_LEAVE_TYPE_CONFIG,
  {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string') {
        const keyUpper = prop.toUpperCase();
        if (target[keyUpper]) return target[keyUpper];
        if (target[prop]) return target[prop];
      }
      return target.AL;
    },
  }
) as unknown as Record<LeaveType, LeaveTypeConfig>;

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'mem-asnad',
    tmId: 'TM-001',
    pin: '123456',
    name: 'Asnad',
    email: 'Asnaadhu@gmail.com',
    avatarColor: 'bg-[#14213D] text-white',
    avatarInitials: 'AA',
    role: 'admin',
    department: 'Operations',
    jobTitle: 'Lead Administrator',
    joinedDate: '2023-01-01',
    allowances: { AL: 25, SL: 14, DO: 52, RR: 10, PH: 10, FRL: 5 },
  },
];

export const INITIAL_HOLIDAYS: PublicHoliday[] = [
  { id: 'hol-1', name: 'Labor Day', date: '2026-09-07', description: 'Federal Holiday - Office Closed' },
  { id: 'hol-2', name: 'Indigenous Peoples Day', date: '2026-10-12', description: 'Federal Holiday' },
  { id: 'hol-3', name: 'Veterans Day', date: '2026-11-11', description: 'Federal Holiday' },
  { id: 'hol-4', name: 'Thanksgiving Day', date: '2026-11-26', description: 'National Holiday' },
  { id: 'hol-5', name: 'Day After Thanksgiving', date: '2026-11-27', description: 'Company Extended Holiday' },
];

export const INITIAL_REQUESTS: TimeOffRequest[] = [
  {
    id: 'req-asnad-1',
    memberId: 'mem-asnad',
    memberName: 'Asnad',
    memberAvatarColor: 'bg-[#14213D] text-white',
    department: 'Operations',
    leaveType: 'AL',
    isOutOfIsland: true,
    startDate: '2026-09-21',
    endDate: '2026-09-25',
    durationType: 'full',
    daysCount: 5,
    reason: 'Annual hiking & vacation trip',
    status: 'approved',
    submittedAt: '2026-09-02T10:30:00Z',
    reviewedAt: '2026-09-03T14:15:00Z',
    reviewedBy: 'Asnad',
    reviewNote: 'Approved annual leave.',
  },
];
