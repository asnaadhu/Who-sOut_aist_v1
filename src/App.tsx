/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Header } from './components/Header';
import { MonthlyCalendar } from './components/Calendar/MonthlyCalendar';
import { TimelineView } from './components/Calendar/TimelineView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { RequestModal } from './components/Requests/RequestModal';
import { LoginPage } from './components/Auth/LoginPage';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';

const AppContent: React.FC = () => {
  const { currentView, isAuthenticated, loading } = useCalendar();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Loading your calendar…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Top Header / App Bar */}
      <Header />

      {/* Main Content Area with mobile bottom safe padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 pt-3 pb-28 sm:py-8">
        {/* Dynamic View Router */}
        {currentView === 'calendar' && <MonthlyCalendar />}
        {currentView === 'timeline' && <TimelineView />}
        {currentView === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Global Request Leave Modal (Drawer / Bottom Sheet on mobile) */}
      <RequestModal />

      {/* Mobile Native-Style Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Desktop Footer (Hidden on mobile for native app feel) */}
      <footer className="hidden sm:block border-t border-neutral-200/80 bg-white py-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>Who’sOut &bull; Centralized Leave Management Hub</p>
          <p className="text-neutral-400 text-[11px]">
            Real-time status indicators, individual request history &amp; admin oversight
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CalendarProvider>
      <AppContent />
    </CalendarProvider>
  );
}
