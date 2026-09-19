import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  X,
  LogOut,
  ShieldCheck,
  Plus,
  Mail,
  Briefcase,
  IdCard,
} from 'lucide-react';
import { LeaveType } from '../../types';

interface MobileProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileProfileSheet: React.FC<MobileProfileSheetProps> = ({ isOpen, onClose }) => {
  const {
    activeMember,
    logout,
    setIsRequestModalOpen,
    setCurrentView,
    getMemberUsedDays,
  } = useCalendar();

  if (!isOpen) return null;

  const isAdmin = activeMember.role === 'admin';
  const used = getMemberUsedDays(activeMember.id);

  const leaveItems: { type: LeaveType; label: string; bg: string; text: string; border: string }[] = [
    { type: 'AL', label: 'Annual Leave', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    { type: 'RR', label: 'Rest & Relax', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    { type: 'SL', label: 'Sick Leave', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    { type: 'DO', label: 'Day Off', bg: 'bg-neutral-100', text: 'text-neutral-800', border: 'border-neutral-200' },
    { type: 'PH', label: 'Public Hol.', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    { type: 'FRL', label: 'Family/Rel.', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200 md:hidden">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div
        className="relative bg-white rounded-t-3xl border-t border-neutral-200 w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250 z-10"
        role="dialog"
      >
        {/* Pull Handle */}
        <div className="pt-2.5 pb-1 flex justify-center bg-neutral-50/70">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <h3 className="text-sm font-bold text-neutral-900">Account &amp; Profile</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Member Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-xs shrink-0 ${activeMember.avatarColor}`}
            >
              {activeMember.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-base font-bold text-neutral-900 truncate">
                  {activeMember.name}
                </h4>
                {isAdmin && (
                  <span className="text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 font-mono">
                <span>{activeMember.tmId || 'TM-001'}</span>
                <span>&bull;</span>
                <span className="font-sans">{activeMember.department}</span>
              </div>
              <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                {activeMember.email}
              </div>
            </div>
          </div>

          {/* Leave Taken Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Leave Taken &bull; 2026
              </span>
              <span className="text-[11px] text-neutral-500">Days Logged</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {leaveItems.map((item) => {
                const usedCount = used[item.type] ?? 0;
                return (
                  <div
                    key={item.type}
                    className={`p-2.5 rounded-xl border ${item.bg} ${item.border} flex items-center justify-between`}
                  >
                    <div>
                      <span className={`text-[11px] font-bold block ${item.text}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-neutral-600 truncate block">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-neutral-900">{usedCount}</span>
                      <span className="text-[10px] text-neutral-500 block">
                        {usedCount === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                onClose();
                setIsRequestModalOpen(true);
              }}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Leave</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  setCurrentView('admin-dashboard');
                }}
                className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-200 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Open Admin Portal</span>
              </button>
            )}

          </div>

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-neutral-100">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
