'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { setActiveAccount, DEFAULT_TEST_USER, UserAccount } from '@/lib/auth/accounts_manager';
import { GoogleAuthModal } from '@/components/auth/google_auth_modal';

interface SignInViewProps {
  onBack?: () => void;
  onGoToSignUp?: () => void;
  onSuccess?: () => void;
  prefilledEmail?: string;
}

export function SignInView({ onBack, onGoToSignUp, onSuccess, prefilledEmail = '' }: SignInViewProps) {
  const router = useRouter();

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setActiveAccount(data.user);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/demo');
        }
      } else {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (user: UserAccount) => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/demo');
    }
  };

  // Test User Quick Login Bypass (Side Docked for dev convenience)
  const handleQuickTestUserLogin = () => {
    setActiveAccount(DEFAULT_TEST_USER);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/demo');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#0047bb',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      className="w-full text-white font-sans antialiased p-4 sm:p-6 select-none relative overflow-x-hidden"
    >
      {/* Top Bar: Brand Logo & Navigation */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pt-2">
        <div
          onClick={onBack || (() => router.push('/'))}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/infra_trace_logo.png" alt="InfraTrace" className="w-9 h-9 object-contain" />
          <span className="text-xl font-bold tracking-tight text-white">InfraTrace</span>
        </div>

        <button
          onClick={onGoToSignUp || (() => router.push('/signup'))}
          className="px-5 py-2 rounded-lg bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
        >
          Create account
        </button>
      </header>

      {/* Main Centered Sign In Card */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className="w-full max-w-md mx-auto py-8 my-auto"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Sign in to InfraTrace
          </h1>
          <p className="text-xs text-blue-100 mt-1.5 font-medium">
            Enter your credentials to access your telemetry cockpit.
          </p>
        </div>

        <div className="w-full bg-white rounded-2xl p-7 sm:p-8 shadow-2xl text-slate-900 border border-slate-100 space-y-5 animate-in fade-in duration-200">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Email Address *</label>
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-transparent outline-none flex-1 text-xs text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Password *</label>
                <a href="#" className="text-[11px] font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-transparent outline-none flex-1 text-xs text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#0047bb' }}
              className="w-full py-3 rounded-xl hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-75"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-semibold uppercase">or</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onGoToSignUp || (() => router.push('/signup'))}
              className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Don't have an account? Create one
            </button>
          </div>
        </div>

        {/* Bottom Helper Links */}
        <div className="text-center pt-8 space-y-2 text-xs text-blue-100">
          <p>
            Want to try with sample data?{' '}
            <button
              onClick={() => router.push('/demo')}
              className="text-white font-bold underline hover:text-blue-200 cursor-pointer"
            >
              Try Playground.
            </button>
          </p>
        </div>
      </main>

      {/* ======================================================== */}
      {/* SIDE-DOCKED FLOATING TEST USER LOGIN BYPASS               */}
      {/* Pinned to outer bottom-right, zero impact on center card  */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-50">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl space-y-2 max-w-[240px]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Dev / Preview Mode</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            One-click bypass to explore as pre-configured Test User:
          </p>
          <button
            type="button"
            onClick={handleQuickTestUserLogin}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>⚡ Test User Login</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-blue-100/80 pt-4 pb-2">
        <span>© {new Date().getFullYear()} InfraTrace LLC. All rights reserved.</span>
      </footer>

      {/* Google Sign-In Chooser Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        initialEmail={email}
      />
    </div>
  );
}
