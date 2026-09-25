import { TeamMember, TimeOffRequest, PublicHoliday, LeaveAllowance, LeaveType, LeaveStatus, DayDuration, UserRole } from '../types';

export interface DbTeamMember {
  id: string;
  tm_id: string | null;
  pin: string | null;
  name: string;
  email: string | null;
  avatar_color: string | null;
  avatar_initials: string | null;
  role: string;
  department: string;
  job_title: string | null;
  joined_date: string | null;
  allowances: Record<string, number> | null;
  pin_changed: boolean | null;
}

export interface DbTimeOffRequest {
  id: string;
  member_id: string;
  member_name: string | null;
  member_avatar_color: string | null;
  department: string | null;
  leave_type: string;
  is_out_of_island: boolean | null;
  start_date: string;
  end_date: string;
  duration_type: string;
  days_count: number;
  reason: string | null;
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
}

export interface DbPublicHoliday {
  id: string;
  name: string;
  date: string;
  description: string | null;
}

const normalizeLeaveType = (type: string): LeaveType => {
  const upper = type.toUpperCase();
  if (['DO', 'PH', 'AL', 'RR', 'SL', 'FRL', 'BT'].includes(upper)) return upper as LeaveType;
  return 'AL';
};

const normalizeLeaveStatus = (status: string): LeaveStatus => {
  const lower = status.toLowerCase();
  if (['pending', 'approved', 'rejected', 'cancelled'].includes(lower)) return lower as LeaveStatus;
  return 'approved';
};

const normalizeDuration = (dur: string): DayDuration => {
  const lower = dur.toLowerCase();
  if (['full', 'morning', 'afternoon'].includes(lower)) return lower as DayDuration;
  return 'full';
};

const normalizeRole = (role: string): UserRole => {
  const lower = role.toLowerCase();
  if (lower === 'admin') return 'admin';
  if (lower === 'member') return 'member';
  return 'requestor';
};

export const dbMemberToApp = (m: DbTeamMember): TeamMember => {
  const rawAllow = m.allowances || {};
  return {
    id: m.id,
    tmId: m.tm_id || undefined,
    pin: m.pin || '123456',
    pinChanged: m.pin_changed ?? false,
    name: m.name,
    email: m.email || '',
    avatarColor: m.avatar_color || 'bg-neutral-800 text-white',
    avatarInitials: m.avatar_initials || 'TM',
    role: normalizeRole(m.role),
    department: m.department,
    jobTitle: m.job_title || 'Team Member',
    joinedDate: m.joined_date || new Date().toISOString().split('T')[0],
    allowances: {
      AL: Number(rawAllow.AL ?? 25),
      SL: Number(rawAllow.SL ?? 14),
      DO: Number(rawAllow.DO ?? 52),
      RR: Number(rawAllow.RR ?? 14),
      PH: Number(rawAllow.PH ?? 10),
      FRL: Number(rawAllow.FRL ?? 5),
      BT: Number(rawAllow.BT ?? 10),
    } as LeaveAllowance,
  };
};

export const appMemberToDb = (m: Partial<TeamMember> & { name: string; department: string; jobTitle: string }): Partial<DbTeamMember> => {
  const obj: Partial<DbTeamMember> = {
    name: m.name.trim(),
    department: m.department,
    job_title: m.jobTitle.trim() || 'Team Member',
  };
  if (m.tmId !== undefined) obj.tm_id = m.tmId;
  if (m.pin !== undefined) obj.pin = m.pin;
  if (m.pinChanged !== undefined) obj.pin_changed = m.pinChanged;
  if (m.email !== undefined) obj.email = m.email;
  if (m.avatarColor !== undefined) obj.avatar_color = m.avatarColor;
  if (m.avatarInitials !== undefined) obj.avatar_initials = m.avatarInitials;
  if (m.role !== undefined) obj.role = m.role;
  if (m.joinedDate !== undefined) obj.joined_date = m.joinedDate;
  if (m.allowances !== undefined) obj.allowances = m.allowances as unknown as Record<string, number>;
  return obj;
};

export const dbRequestToApp = (r: DbTimeOffRequest): TimeOffRequest => ({
  id: r.id,
  memberId: r.member_id,
  memberName: r.member_name || '',
  memberAvatarColor: r.member_avatar_color || 'bg-neutral-800 text-white',
  department: r.department || '',
  leaveType: normalizeLeaveType(r.leave_type),
  isOutOfIsland: Boolean(r.is_out_of_island),
  startDate: r.start_date,
  endDate: r.end_date,
  durationType: normalizeDuration(r.duration_type),
  daysCount: r.days_count,
  reason: r.reason || 'No specific note provided',
  status: normalizeLeaveStatus(r.status),
  submittedAt: r.submitted_at || new Date().toISOString(),
  reviewedAt: r.reviewed_at || undefined,
  reviewedBy: r.reviewed_by || undefined,
  reviewNote: r.review_note || undefined,
});

export const dbHolidayToApp = (h: DbPublicHoliday): PublicHoliday => ({
  id: h.id,
  name: h.name,
  date: h.date,
  description: h.description || undefined,
});
