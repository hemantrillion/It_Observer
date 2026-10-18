'use client';

import React from 'react';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

interface SignInViewProps {
  onBack?: () => void;
  onGoToSignUp?: () => void;
}

export function SignInView({ onBack, onGoToSignUp }: SignInViewProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/infra_trace_logo.png" alt="InfraTrace" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">InfraTrace</span>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your credentials to access telemetry consoles.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                defaultValue="xyztestuser@gmail.com"
                className="bg-transparent outline-none flex-1 text-xs"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                defaultValue="••••••••"
                className="bg-transparent outline-none flex-1 text-xs"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-700/60">
          <button
            type="button"
            onClick={onGoToSignUp}
            className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
          >
            Don't have an account? Create one
          </button>
        </div>
      </div>
    </div>
  );
}
