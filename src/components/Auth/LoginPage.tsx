import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  Lock,
  IdCard,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  MessageCircle,
  Mail,
  LifeBuoy,
  ChevronDown,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useCalendar();

  const [tmId, setTmId] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50/80 via-cyan-50/40 to-neutral-50 text-neutral-900 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden font-sans antialiased">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 pt-4 sm:pt-6">
        {/* Resort Logo */}
        <div className="flex justify-center mb-2">
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
        <div className="bg-white/90 backdrop-blur-sm border border-teal-100/80 rounded-2xl p-6 sm:p-8 shadow-lg shadow-teal-900/5">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 font-mono focus:bg-white focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all"
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
                  className="w-full pl-10 pr-11 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 font-mono tracking-widest focus:bg-white focus:outline-hidden focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all"
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
              disabled={isLoading || !tmId.trim() || pin.length !== 6}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white hover:from-teal-800 hover:to-teal-900 disabled:from-[#E4E4E4] disabled:to-[#E4E4E4] disabled:text-[#14213D] font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
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

        {/* Account support contact */}
        <div className="bg-white/90 backdrop-blur-sm border border-teal-100/80 rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSupport(!showSupport)}
            className="w-full flex items-center gap-2.5 px-5 py-3.5 bg-teal-50/50 hover:bg-teal-50/80 transition-colors"
          >
            <LifeBuoy className="w-4 h-4 text-teal-600 shrink-0" />
            <p className="text-xs font-semibold text-neutral-700 text-left flex-1">
              Need account access or password reset?
            </p>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showSupport ? 'rotate-180' : ''}`} />
          </button>
          {showSupport && (
            <div className="px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm font-semibold text-neutral-900 text-center">
                Ahmed Asnad
              </p>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href="https://wa.me/9607292184"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-teal-50/50 border border-teal-100 hover:border-teal-300 hover:bg-white transition-all group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 text-white shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">WhatsApp</span>
                    <span className="text-xs text-neutral-800 font-medium group-hover:text-neutral-900 transition-colors">+960 729 2184</span>
                  </span>
                </a>
                <a
                  href="mailto:aasnad@avanihotels.com"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-teal-50/50 border border-teal-100 hover:border-teal-300 hover:bg-white transition-all group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 text-white shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase tracking-wide text-neutral-400 font-semibold">Email</span>
                    <span className="text-xs text-neutral-800 font-medium group-hover:text-neutral-900 transition-colors truncate">aasnad@avanihotels.com</span>
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* About Who's Out */}
        <div className="text-center space-y-3 px-2 pt-2">
          <h2 className="text-sm font-bold tracking-tight text-neutral-800">
            About Who’s Out
          </h2>
          <div className="space-y-2 text-xs leading-relaxed text-neutral-500 max-w-sm mx-auto">
            <p>
              Who’s Out was born to solve a classic workplace mystery:
              are they ghosting us, or have they been sipping drinks on a beach since Tuesday?
            </p>
            <p>
              Three unanswered pings in, I realized I still had zero clue who was actually working, who took the week off, and who had simply vanished to Dhakendhoo for a BBQ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
