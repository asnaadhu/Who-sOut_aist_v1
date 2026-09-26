import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ShieldCheck,
  Plus,
  Layers,
  LogOut,
} from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';
import { ViewTab } from '../types';

export const Header: React.FC = () => {
  const {
    activeMember,
    currentView,
    setCurrentView,
    setIsRequestModalOpen,
    logout,
  } = useCalendar();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = activeMember.role === 'admin';

  const navItems: { id: ViewTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'timeline', label: 'Timeline', icon: Layers },
    ...(isAdmin
      ? [
          {
            id: 'admin-dashboard' as ViewTab,
            label: 'Admin Portal',
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-teal-100/80 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/whoisout.png"
              alt="Who's Out"
              className="h-9 sm:h-10 w-auto rounded-lg shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-semibold text-neutral-900 text-sm sm:text-base leading-tight tracking-tight truncate">
                Who’sOut
              </h1>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-teal-50/60 p-1 rounded-xl border border-teal-100/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                    isActive
                      ? 'bg-white text-teal-900 shadow-sm border border-teal-100 font-semibold'
                      : 'text-neutral-600 hover:text-teal-900 hover:bg-teal-100/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Request Leave (desktop) + Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="header-request-leave-btn"
              onClick={() => setIsRequestModalOpen(true)}
              className="hidden sm:flex h-9 px-3.5 items-center gap-1.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer hover:shadow-md"
              title="Request Leave"
              aria-label="Request Leave"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Add Leave</span>
            </button>

            {/* Logged-In User Profile Dropdown (Desktop Only) */}
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                id="profile-switcher-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-9 h-9 min-w-[36px] min-h-[36px] hidden sm:flex items-center justify-center rounded-lg border border-teal-100 hover:border-teal-300 bg-white hover:bg-teal-50/50 transition-colors cursor-pointer"
                title={`Profile: ${activeMember.name} (${activeMember.tmId || 'TM-001'})`}
                aria-label="User Profile"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${activeMember.avatarColor}`}
                >
                  {activeMember.avatarInitials}
                </div>
              </button>

              {/* Mobile backdrop for dropdown */}
              {isProfileMenuOpen && (
                <div
                  className="fixed inset-0 bg-neutral-900/30 backdrop-blur-xs z-40 sm:hidden"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
              )}

              {/* Dropdown Menu - Logged In User Profile Only */}
              {isProfileMenuOpen && (
                <div className="fixed inset-x-3 top-20 sm:absolute sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-lg border border-neutral-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] flex flex-col space-y-3.5">
                  {/* Profile Header */}
                  <div className="flex items-start gap-3 pb-3 border-b border-neutral-100">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-xs ${activeMember.avatarColor}`}
                    >
                      {activeMember.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-sm font-bold text-neutral-900 truncate">
                          {activeMember.name}
                        </h2>
                        {activeMember.role === 'admin' ? (
                          <span className="text-[10px] bg-gradient-to-r from-teal-700 to-teal-900 text-white font-bold px-1.5 py-0.2 rounded">
                            Admin
                          </span>
                        ) : (
                          <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.2 rounded border border-teal-200">
                            Requestor
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {activeMember.jobTitle} &bull; {activeMember.department}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-600 font-mono">
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 font-bold text-neutral-800">
                          {activeMember.tmId || 'TM-001'}
                        </span>
                        <span className="text-neutral-400">&bull;</span>
                        <span className="text-neutral-500 truncate">{activeMember.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsRequestModalOpen(true);
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Time Off</span>
                    </button>

                    {/* Sign Out (admins only) */}
                    {isAdmin && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of Account</span>
                    </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-100" />
                </div>
              )}
            </div>

            {/* Quick Sign Out Icon Button in Desktop Header (admins only) */}
            {isAdmin && (
            <button
              onClick={logout}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-500 hover:text-teal-800 hover:bg-teal-50 rounded-lg border border-transparent hover:border-teal-200 transition-colors"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-400" />
              <span>Sign Out</span>
            </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
