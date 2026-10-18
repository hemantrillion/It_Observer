'use client';

import React, { useEffect, useRef } from 'react';
import { X, ChevronUp, Plus, LogOut } from 'lucide-react';

interface GmailAccountFlyoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
  onAddAccount?: () => void;
}

export function GmailAccountFlyoutPanel({
  isOpen,
  onClose,
  userName = 'Test User',
  userEmail = 'xyztestuser@gmail.com',
  onSignOut,
  onAddAccount,
}: GmailAccountFlyoutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const isTrigger = (event.target as HTMLElement)?.closest?.('[data-panel-trigger="account-flyout"]');
        if (isTrigger) return;
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-16 right-4 z-50 w-[356px] bg-white text-slate-900 rounded-[28px] shadow-2xl border border-slate-200/90 p-4 space-y-3 font-sans select-none animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Top Header with Close (X) button */}
      <div className="flex items-center justify-end pr-1 pt-0.5">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Account Info & Account Actions Container */}
      <div className="bg-slate-50/80 rounded-2xl overflow-hidden divide-y divide-slate-100 border border-slate-200/80 shadow-2xs">
        {/* Profile Card Row */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular Avatar with InfraTrace logo (no pencil edit badge) */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
                <img
                  src="/infra_trace_logo.png"
                  alt="Test User"
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>

            {/* Name & Email Address */}
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight truncate">
                {userName}
              </span>
              <span className="text-xs text-slate-500 font-normal truncate max-w-[175px] mt-0.5">
                {userEmail}
              </span>
            </div>
          </div>

          {/* Chevron Up collapse button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Account details"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* Action: Add another account */}
        <button
          type="button"
          onClick={onAddAccount}
          className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-100/70 text-slate-700 text-sm font-medium transition-colors text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add another account</span>
        </button>

        {/* Action: Sign out */}
        <button
          type="button"
          onClick={onSignOut}
          className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-100/70 text-slate-700 text-sm font-medium transition-colors text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Sign out</span>
        </button>
      </div>

      {/* Manage your Account button with InfraTrace logo */}
      <button
        type="button"
        className="w-full py-3 px-4 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 flex items-center gap-3 text-slate-800 text-sm font-semibold transition-colors cursor-pointer shadow-xs"
      >
        <img
          src="/infra_trace_logo.png"
          alt="InfraTrace"
          className="w-5 h-5 object-contain shrink-0"
        />
        <span className="truncate">Manage your Account</span>
      </button>

      {/* Footer Links */}
      <div className="pt-1 pb-0.5 flex items-center justify-center gap-2 text-xs text-slate-400">
        <a href="#" className="hover:underline hover:text-slate-600 transition-colors">
          Privacy Policy
        </a>
        <span>•</span>
        <a href="#" className="hover:underline hover:text-slate-600 transition-colors">
          Terms of Service
        </a>
      </div>
    </div>
  );
}
