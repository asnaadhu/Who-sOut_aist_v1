import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  Lock,
  IdCard,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Mail,
  LifeBuoy,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useCalendar();

  const [tmId, setTmId] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(tmId, pin);
      if (!result.success) {
        setError(result.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden font-sans antialiased">
      {/* Ambient background decoration matching the calm neutral aesthetic */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-neutral-200/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-neutral-200/50 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 pt-8 sm:pt-12">
        {/* Resort Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/Logo_BW.png"
            alt="Avani+ Fares Maldives Resort"
            className="w-52 sm:w-60 h-auto object-contain"
          />
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Who’sOut
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TM ID Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center justify-between">
                <span>Team Member ID</span>

              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <IdCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={tmId}
                  onChange={(e) => {
                    setTmId(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  placeholder="30034"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 font-mono focus:bg-white focus:outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                />
              </div>
            </div>

            {/* 6-Digit PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700">
                  6-Digit Security PIN
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(clean);
                    if (error) setError(null);
                  }}
                  placeholder="••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 font-mono tracking-widest focus:bg-white focus:outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* 6-digit indicator dots */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-150 ${
                        filled ? 'bg-neutral-900 shadow-2xs' : 'bg-neutral-200'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !tmId.trim() || pin.length !== 6}
              className="w-full mt-2 py-3 px-4 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security assurance */}
        <div className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>Role-based access &bull; Administrators manage user PINs in Settings</span>
        </div>

        {/* Account support contact */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/80">
            <LifeBuoy className="w-4 h-4 text-neutral-500 shrink-0" />
            <p className="text-xs font-semibold text-neutral-700">
              Need account access or password reset?
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm font-semibold text-neutral-900 text-center">
              Ahmed Asnad
            </p>
            <div className="grid grid-cols-1 gap-2">
              <a
                href="https://wa.me/9607292184"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 text-white shrink-0">
                  <MessageCircle className="w-3.5 h-3.5" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">WhatsApp</span>
                  <span className="text-xs text-neutral-800 font-medium group-hover:text-neutral-900 transition-colors">+960 729 2184</span>
                </span>
              </a>
              <a
                href="mailto:aasnad@avanihotels.com"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 text-white shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">Email</span>
                  <span className="text-xs text-neutral-800 font-medium group-hover:text-neutral-900 transition-colors truncate">aasnad@avanihotels.com</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
