export type UserRole = 'admin' | 'requestor' | 'member';

export type Department = string;

export type LeaveType = 'DO' | 'PH' | 'AL' | 'RR' | 'SL' | 'FRL';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type DayDuration = 'full' | 'morning' | 'afternoon';

export interface LeaveAllowance {
  AL: number;
  SL: number;
  DO: number;
  RR: number;
  PH: number;
  FRL: number;
}

export interface TeamMember {
  id: string;
  tmId?: string; // Team Member ID (e.g. TM-001)
  pin?: string;  // 6-digit authentication PIN (e.g. '123456')
  pinChanged?: boolean; // false until the user changes their PIN on first login
  name: string;
  email: string;
  avatarColor: string;
  avatarInitials: string;
  role: UserRole;
  department: Department;
  jobTitle: string; // Position
  joinedDate: string;
  allowances: LeaveAllowance;
}

export interface TimeOffRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatarColor: string;
  department: Department;
  leaveType: LeaveType;
  isOutOfIsland?: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  durationType: DayDuration;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export type ViewTab = 'calendar' | 'timeline' | 'admin-dashboard';

export type CalendarViewMode = 'week' | 'month';

export interface LeaveTypeConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
  dotColor: string;
  iconName: string;
  description: string;
}
