'use client';

import React, { useState } from 'react';
import { X, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserAccount, setActiveAccount, DEFAULT_TEST_USER, getStoredAccounts } from '@/lib/auth/accounts_manager';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialEmail?: string;
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
}: GoogleAuthModalProps) {
  const [customEmail, setCustomEmail] = useState(initialEmail);
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(!initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const storedAccounts = getStoredAccounts();
  const testAccount = DEFAULT_TEST_USER;

  const handleSelectAccount = async (selectedEmail: string, selectedName?: string) => {
    setIsLoading(true);
    setError('');

    try {
      const email = selectedEmail.toLowerCase().trim();
      const name = selectedName || email.split('@')[0];

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          avatarUrl: '/infra_trace_logo.png',
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setActiveAccount(data.user);
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Failed to authenticate with Google.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    handleSelectAccount(customEmail, customName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-900 font-sans animate-in zoom-in-95 duration-200">
        {/* Header with Google Logo & Close */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sign in with Google</h2>
            </div>
            <p className="text-xs text-slate-500">
              Choose an account to continue to <strong className="text-slate-800">InfraTrace</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Account Selection List */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {/* Quick Pick: Test User */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectAccount(testAccount.email, testAccount.name)}
              className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-200">
                  TU
                </div>
                <div className="truncate">
                  <span className="text-sm font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                    {testAccount.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono block truncate">
                    {testAccount.email}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Quick Pick: Initial typed email if present and different */}
            {initialEmail && initialEmail !== testAccount.email && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectAccount(initialEmail)}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-200">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                      {initialEmail.split('@')[0]}
                    </span>
                    <span className="text-xs text-slate-500 font-mono block truncate">
                      {initialEmail}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            )}

            {/* Any other accounts in stored accounts */}
            {storedAccounts
              .filter((acc) => acc.email !== testAccount.email && acc.email !== initialEmail)
              .slice(0, 2)
              .map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectAccount(acc.email, acc.name)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-200">
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="text-sm font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                        {acc.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono block truncate">
                        {acc.email}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
          </div>

          {/* Use Another Account Toggle / Input */}
          <div className="pt-2 border-t border-slate-100">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-2.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer text-center"
              >
                + Use another Google account
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Enter your Gmail address *</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="youremail@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Display Name (optional)</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-75 shadow-xs"
                  >
                    {isLoading ? 'Connecting Google Account...' : 'Continue with this Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Google OAuth 2.0 Simulation</span>
          </div>
          <a href="#" className="hover:underline text-slate-600">Privacy & Terms</a>
        </div>
      </div>
    </div>
  );
}
