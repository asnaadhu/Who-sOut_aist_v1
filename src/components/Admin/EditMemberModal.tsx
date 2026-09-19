import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Department, TeamMember, UserRole } from '../../types';
import { X, UserCheck, Shield, User } from 'lucide-react';
import { AvatarPicker } from './AvatarPicker';
import { DEFAULT_AVATAR } from '../../data/avatars';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const { updateMember, members } = useCalendar();

  const [name, setName] = useState('');
  const [tmId, setTmId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [pin, setPin] = useState('123456');
  const [role, setRole] = useState<UserRole>('requestor');
  const [avatarColor, setAvatarColor] = useState<string>(DEFAULT_AVATAR);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setTmId(member.tmId || member.id.replace('mem-', 'TM-'));
      setEmail(member.email || '');
      setDepartment(member.department);
      setPosition(member.jobTitle);
      setPin(member.pin || '123456');
      setRole(member.role === 'admin' ? 'admin' : 'requestor');
      setAvatarColor(member.avatarColor || DEFAULT_AVATAR);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const existingDepartments = Array.from(
    new Set(members.map((m) => m.department).filter(Boolean))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateMember(member.id, {
      name: name.trim(),
      tmId: tmId.trim().toUpperCase() || member.tmId || 'TM-001',
      email: email.trim(),
      department: department.trim() || 'General',
      jobTitle: position.trim() || 'Team Member',
      pin: pin.length === 6 ? pin : member.pin || '123456',
      role,
      avatarColor,
      allowances: member.allowances,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        {/* Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center bg-neutral-50/60">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${member.avatarColor}`}>
              {member.avatarInitials}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-neutral-900 truncate">Edit User: {member.name}</h3>
              <p className="text-xs text-neutral-500 truncate">Update user details and role permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white text-neutral-900 font-medium"
            />
          </div>

          {/* Avatar */}
          <AvatarPicker value={avatarColor} onChange={setAvatarColor} name={name} />

          {/* TM ID */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Team Member ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tmId}
              onChange={(e) => setTmId(e.target.value)}
              placeholder="e.g. TM-001"
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white text-neutral-900 font-semibold uppercase tracking-wider"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Unique team member identification code</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ahmed.asnad@avanihotels.com"
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white text-neutral-900 font-medium"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Used for account-related notifications</p>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="edit-department-suggestions"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering, Marketing, Operations"
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white text-neutral-900 font-medium"
            />
            {existingDepartments.length > 0 && (
              <datalist id="edit-department-suggestions">
                {existingDepartments.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Systems Engineer / Operations Lead"
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white text-neutral-900 font-medium"
            />
          </div>

          {/* 6-Digit PIN */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Security PIN (6 Digits) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">Authentication Credential</span>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full text-xs border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 focus:bg-white text-neutral-900 font-mono tracking-widest font-bold"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Used by member together with their TM ID to sign in</p>
          </div>

          {/* Role Assignment */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Assigned System Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('requestor')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  role === 'requestor'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-indigo-950'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <User className={`w-4 h-4 mt-0.5 shrink-0 ${role === 'requestor' ? 'text-indigo-600' : 'text-neutral-400'}`} />
                <div>
                  <p className="text-xs font-bold">Requestor</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Can add &amp; delete only their own leave. Access to Calendar &amp; Timeline.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  role === 'admin'
                    ? 'border-neutral-900 bg-neutral-900 text-white ring-1 ring-neutral-900'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${role === 'admin' ? 'text-amber-400' : 'text-neutral-400'}`} />
                <div>
                  <p className="text-xs font-bold">Admin</p>
                  <p className={`text-[11px] mt-0.5 ${role === 'admin' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Create users, check reports, and access the Admin Portal.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
