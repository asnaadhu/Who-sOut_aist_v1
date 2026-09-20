import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ChangePinPage: React.FC = () => {
  const { changePin, activeMember } = useCalendar();

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPin.length !== 6) {
      setError('New PIN must be exactly 6 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match. Please re-enter the same PIN.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = changePin(newPin);
      if (!result.success) {
        setError(result.error || 'Failed to change PIN. Please try again.');
        setIsLoading(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/80 via-cyan-50/40 to-neutral-50 text-neutral-900 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden font-sans antialiased">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-md shadow-teal-900/10 mb-1">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Set a New PIN
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Welcome, {activeMember.name}. For security, please choose a new 6-digit PIN to replace the one assigned to you.
          </p>
        </div>

        {/* Change PIN Card */}
        <div className="bg-white/90 backdrop-blur-sm border border-teal-100/80 rounded-2xl p-6 sm:p-8 shadow-lg shadow-teal-900/5">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New PIN Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                New 6-Digit PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setNewPin(clean);
                    if (error) setError(null);
                  }}
                  placeholder="••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 font-mono tracking-widest focus:bg-white focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-teal-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const filled = newPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-150 ${
                        filled ? 'bg-gradient-to-r from-teal-600 to-teal-700 shadow-2xs' : 'bg-neutral-200'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Confirm PIN Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Confirm New PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmPin}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setConfirmPin(clean);
                    if (error) setError(null);
                  }}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 font-mono tracking-widest focus:bg-white focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all"
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const filled = confirmPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-150 ${
                        filled ? 'bg-gradient-to-r from-teal-600 to-teal-700 shadow-2xs' : 'bg-neutral-200'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || newPin.length !== 6 || confirmPin.length !== 6}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white hover:from-teal-800 hover:to-teal-900 disabled:bg-neutral-200 disabled:text-neutral-400 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Set New PIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security note */}
        <div className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          <span>This is a one-time step. You won&apos;t be asked again.</span>
        </div>
      </div>
    </div>
  );
};
