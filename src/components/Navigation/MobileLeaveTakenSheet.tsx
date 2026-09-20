import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { X } from 'lucide-react';
import { LeaveType } from '../../types';

interface MobileLeaveTakenSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileLeaveTakenSheet: React.FC<MobileLeaveTakenSheetProps> = ({ isOpen, onClose }) => {
  const { activeMember, getMemberUsedDays } = useCalendar();

  if (!isOpen) return null;

  const used = getMemberUsedDays(activeMember.id);

  const leaveItems: { type: LeaveType; label: string; bg: string; text: string; border: string }[] = [
    { type: 'AL', label: 'Annual Leave', bg: 'bg-[#14213D]', text: 'text-white', border: 'border-[#14213D]' },
    { type: 'RR', label: 'Rest & Relax', bg: 'bg-[#FCA311]', text: 'text-[#14213D]', border: 'border-[#14213D]' },
    { type: 'SL', label: 'Sick Leave', bg: 'bg-[#000000]', text: 'text-white', border: 'border-[#000000]' },
    { type: 'DO', label: 'Day Off', bg: 'bg-[#E4E4E4]', text: 'text-[#000000]', border: 'border-[#000000]' },
    { type: 'PH', label: 'Public Hol.', bg: 'bg-[#FCA311]', text: 'text-[#14213D]', border: 'border-[#14213D]' },
    { type: 'FRL', label: 'Family/Rel.', bg: 'bg-[#E4E4E4]', text: 'text-[#14213D]', border: 'border-[#14213D]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#14213D]/50 backdrop-blur-xs animate-in fade-in duration-200 md:hidden">
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
          <h3 className="text-sm font-bold text-neutral-900">Leave Taken &bull; 2026</h3>
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
          {/* Total Summary */}
          <div className="flex items-center justify-between p-4 bg-[#14213D] rounded-2xl text-white">
            <div>
              <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Total Days Used</span>
              <div className="text-3xl font-bold mt-0.5">{used.total ?? 0}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block">Across all</span>
              <span className="text-[11px] text-neutral-400 block">leave types</span>
            </div>
          </div>

          {/* Leave Breakdown */}
          <div>
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider block mb-2">
              Breakdown
            </span>
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
        </div>
      </div>
    </div>
  );
};
