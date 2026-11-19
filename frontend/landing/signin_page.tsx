'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { setActiveAccount, DEFAULT_TEST_USER, UserAccount } from '@/lib/auth/accounts_manager';
import { GoogleAuthButton } from '@/components/auth/google_auth_button';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error');
      const urlEmail = params.get('email');
      if (urlError) {
        setErrorMessage(decodeURIComponent(urlError));
      }
      if (urlEmail && !email) {
        setEmail(urlEmail);
      }
    }
  }, [email]);

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

  const handleRealGoogleSuccess = (user: UserAccount) => {
    setActiveAccount(user);
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
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center space-y-2">
              <div>{errorMessage}</div>
              {errorMessage.includes('No account found') && (
                <div>
                  <button
                    type="button"
                    onClick={onGoToSignUp || (() => router.push(`/signup?email=${encodeURIComponent(email)}`))}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Create account with this email</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
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

          {/* Prominent Continue with Google */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-semibold uppercase">or</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <GoogleAuthButton
            context="signin"
            onSuccess={handleRealGoogleSuccess}
            onError={(err) => setErrorMessage(err)}
          />

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

      {/* Footer */}
      <footer className="text-center text-xs text-blue-100/80 pt-4 pb-2">
        <span>© {new Date().getFullYear()} InfraTrace LLC. All rights reserved.</span>
      </footer>
    </div>
  );
}
