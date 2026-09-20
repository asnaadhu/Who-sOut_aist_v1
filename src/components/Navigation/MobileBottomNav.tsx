import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Layers,
  Plus,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { MobileProfileSheet } from './MobileProfileSheet';
import { MobileLeaveTakenSheet } from './MobileLeaveTakenSheet';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setIsRequestModalOpen,
    activeMember,
  } = useCalendar();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaveTakenOpen, setIsLeaveTakenOpen] = useState(false);
  const isAdmin = activeMember.role === 'admin';

  return (
    <>
      {/* Fixed Bottom App Navigation Bar for Mobile */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-teal-100/80 px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-4px_24px_rgba(13,148,136,0.08)] md:hidden transition-transform duration-200"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Calendar Tab */}
          <button
            type="button"
            onClick={() => setCurrentView('calendar')}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
              currentView === 'calendar'
                ? 'text-neutral-950 font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <div
              className={`w-10 h-7 rounded-full flex items-center justify-center transition-colors ${
                currentView === 'calendar' ? 'bg-teal-800 text-white shadow-sm' : ''
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Calendar</span>
          </button>

          {/* Timeline Tab */}
          <button
            type="button"
            onClick={() => setCurrentView('timeline')}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
              currentView === 'timeline'
                ? 'text-neutral-950 font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <div
              className={`w-10 h-7 rounded-full flex items-center justify-center transition-colors ${
                currentView === 'timeline' ? 'bg-teal-800 text-white shadow-sm' : ''
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Timeline</span>
          </button>

          {/* Elevated Central Add Leave Action Button */}
          <div className="flex flex-col items-center justify-center -mt-5">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="w-13 h-13 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-teal-900/20 border-2 border-white ring-4 ring-teal-900/10 transition-all cursor-pointer group"
              title="Add Leave Request"
              aria-label="Add Leave Request"
            >
              <Plus className="w-6 h-6 text-emerald-300 group-hover:rotate-90 transition-transform duration-200" />
            </button>
            <span className="text-[9.5px] mt-1 text-neutral-600 font-semibold tracking-tight">
              Add Leave
            </span>
          </div>

          {/* Admin Tab (or Status for non-admin) */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setCurrentView('admin-dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
                currentView === 'admin-dashboard'
                  ? 'text-neutral-950 font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div
                className={`w-10 h-7 rounded-full flex items-center justify-center transition-colors ${
                  currentView === 'admin-dashboard' ? 'bg-teal-800 text-white shadow-sm' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Admin</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLeaveTakenOpen(true)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
                isLeaveTakenOpen ? 'text-neutral-950 font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="w-10 h-7 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Leave Taken</span>
            </button>
          )}

          {/* Profile / Account Tab */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
              isProfileOpen ? 'text-neutral-950 font-bold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <div className="w-10 h-7 rounded-full flex items-center justify-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-1 ring-teal-200 ${activeMember.avatarColor}`}
              >
                {activeMember.avatarInitials}
              </div>
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Account</span>
          </button>
        </div>
      </nav>

      {/* Mobile Profile Bottom Sheet */}
      <MobileProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Mobile Leave Taken Bottom Sheet */}
      <MobileLeaveTakenSheet
        isOpen={isLeaveTakenOpen}
        onClose={() => setIsLeaveTakenOpen(false)}
      />
    </>
  );
};
