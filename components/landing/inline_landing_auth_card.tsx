'use client';

import React, { useState } from 'react';
import { Mail, Lock, Sparkles, ArrowLeft, ShieldCheck, User } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/google_auth_button';
import { setActiveAccount, GUEST_DEMO_USER, UserAccount } from '@/lib/auth/accounts_manager';

interface InlineLandingAuthCardProps {
  initialMode?: 'signin' | 'signup' | 'demo';
  onSuccess: (user: UserAccount) => void;
  onCancel: () => void;
}

export function InlineLandingAuthCard({
  initialMode = 'signin',
  onSuccess,
  onCancel,
}: InlineLandingAuthCardProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'demo'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle direct Demo / Guest access
  const handleEnterDemoGuest = () => {
    setActiveAccount(GUEST_DEMO_USER);
    onSuccess(GUEST_DEMO_USER);
  };

  // Handle Google Auth success
  const handleGoogleSuccess = (user: UserAccount) => {
    setActiveAccount(user);
    onSuccess(user);
  };

  // Handle Email Authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setActiveAccount(data.user);
          onSuccess(data.user);
        } else {
          setErrorMessage(data.error || 'Authentication failed. Please check credentials.');
        }
      } else {
        // Sign Up
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
            firstName: fullName.split(' ')[0] || email.split('@')[0],
            lastName: fullName.split(' ').slice(1).join(' ') || '',
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setActiveAccount(data.user);
          onSuccess(data.user);
        } else {
          setErrorMessage(data.error || 'Account creation failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 text-left select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header Row with Back button & Mode Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Tab switcher */}
        <div className="flex rounded-full bg-slate-100 p-0.5 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('demo');
              setErrorMessage('');
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              mode === 'demo' ? 'bg-slate-200 text-slate-900 font-extrabold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Demo
          </button>
        </div>
      </div>

      {/* MODE 1: DEMO ACCESS TAB */}
      {mode === 'demo' ? (
        <div className="py-4 space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
            <span className="inline-block p-2 rounded-full bg-slate-200 text-slate-700 mb-1">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Instant Demo Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore the live InfraTrace Telemetry Cockpit without creating an account. (Demo guest access is restricted to the telemetry dashboard).
            </p>
          </div>

          <button
            type="button"
            onClick={handleEnterDemoGuest}
            className="w-full py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-extrabold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>⚡ Enter as Demo Guest (No Account)</span>
          </button>
        </div>
      ) : (
        /* MODE 2: SIGN IN OR SIGN UP TAB */
        <div className="py-3 space-y-4 animate-in fade-in duration-150">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create an InfraTrace account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signin'
                ? 'Sign in with your Google account or email credentials.'
                : 'Get started observing services and synthetic telemetry.'}
            </p>
          </div>

          {/* Primary Action: Continue with Google */}
          <div>
            <GoogleAuthButton
              context={mode}
              onSuccess={handleGoogleSuccess}
              onError={(err) => setErrorMessage(err)}
            />
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-bold uppercase">or continue with email</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Hemant Kumar"
                    className="bg-transparent outline-none w-full text-slate-900"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-transparent outline-none w-full text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-transparent outline-none w-full text-slate-900"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-75"
            >
              {isLoading
                ? 'Verifying...'
                : mode === 'signin'
                ? 'Sign In with Email'
                : 'Complete Registration'}
            </button>
          </form>

          {/* Quick toggle between Sign In and Sign Up */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
