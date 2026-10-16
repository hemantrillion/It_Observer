'use client';

import React, { useEffect, useRef } from 'react';
import { X, ChevronUp, Plus, LogOut, Pencil } from 'lucide-react';

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
  userName = 'HemanT',
  userEmail = 'hemantrillion@gmail.com',
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
      className="absolute top-16 right-4 z-50 w-[356px] bg-[#1e1f20] text-white rounded-[28px] shadow-2xl border border-white/10 p-3.5 space-y-2.5 font-sans select-none animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Top Header with Close (X) button */}
      <div className="flex items-center justify-end pr-1 pt-0.5">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Account Info & Account Actions Container */}
      <div className="bg-[#131314] rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5 shadow-inner">
        {/* Profile Card Row */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular Avatar with Bakery/Croissant logo & pencil edit badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden border border-white/20">
                {/* Bakery/Croissant vector icon matching Gmail screenshot */}
                <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                  <ellipse cx="20" cy="22" rx="14" ry="9" fill="#f57c00" />
                  <path d="M9 22c2-4 7-7 11-7s9 3 11 7" fill="#ffa726" />
                  <path d="M12 20c1.5-2.5 5-4.5 8-4.5s6.5 2 8 4.5" fill="#ffb74d" />
                  <ellipse cx="20" cy="23" rx="12" ry="7" fill="#fb8c00" />
                  <path d="M14 20q3 3 6 3t6-3" stroke="#e65100" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Bottom right pencil edit badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1e1f20] border border-white/20 flex items-center justify-center text-white shadow-xs">
                <Pencil className="w-2.5 h-2.5 text-gray-200" />
              </div>
            </div>

            {/* Name & Email Address */}
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-semibold text-white tracking-tight leading-tight truncate">
                {userName}
              </span>
              <span className="text-xs text-[#9aa0a6] font-normal truncate max-w-[175px] mt-0.5">
                {userEmail}
              </span>
            </div>
          </div>

          {/* Chevron Up collapse button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-gray-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Account details"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* Action: Add another account */}
        <button
          type="button"
          onClick={onAddAccount}
          className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-white/5 text-white text-sm font-medium transition-colors text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add another account</span>
        </button>

        {/* Action: Sign out */}
        <button
          type="button"
          onClick={onSignOut}
          className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-white/5 text-white text-sm font-medium transition-colors text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Sign out</span>
        </button>
      </div>

      {/* Pill 1: Manage your Google Account */}
      <button
        type="button"
        className="w-full py-3 px-4 rounded-full bg-[#131314] hover:bg-white/10 border border-white/5 flex items-center gap-3.5 text-white text-sm font-medium transition-colors cursor-pointer shadow-xs"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.27 21.36 7.34 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2.0 10.05.0 12s.46 3.8.1.28 5.42l4-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
        </svg>
        <span className="truncate">Manage your Google Account</span>
      </button>

      {/* Pill 2: Get a Google AI plan */}
      <button
        type="button"
        className="w-full py-3 px-4 rounded-full bg-[#131314] hover:bg-white/10 border border-white/5 flex items-center gap-3.5 text-white text-sm font-medium transition-colors cursor-pointer shadow-xs"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
            fill="url(#gemini_grad)"
          />
          <defs>
            <linearGradient id="gemini_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9BC5FF" />
              <stop offset="0.5" stopColor="#D96570" />
              <stop offset="1" stopColor="#F9AB00" />
            </linearGradient>
          </defs>
        </svg>
        <span className="truncate">Get a Google AI plan</span>
      </button>

      {/* Pill 3: 1% of 15 GB used */}
      <button
        type="button"
        className="w-full py-3 px-4 rounded-full bg-[#131314] hover:bg-white/10 border border-white/5 flex items-center gap-3.5 text-white text-sm font-medium transition-colors cursor-pointer shadow-xs"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
            stroke="url(#cloud_grad)"
          />
          <defs>
            <linearGradient id="cloud_grad" x1="0" y1="4" x2="24" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4285F4" />
              <stop offset="0.33" stopColor="#EA4335" />
              <stop offset="0.66" stopColor="#FBBC05" />
              <stop offset="1" stopColor="#34A853" />
            </linearGradient>
          </defs>
        </svg>
        <span className="truncate">1% of 15 GB used</span>
      </button>

      {/* Footer Links */}
      <div className="pt-2 pb-0.5 flex items-center justify-center gap-2 text-xs text-[#9aa0a6]">
        <a href="#" className="hover:underline hover:text-white transition-colors">
          Privacy Policy
        </a>
        <span>•</span>
        <a href="#" className="hover:underline hover:text-white transition-colors">
          Terms of Service
        </a>
      </div>
    </div>
  );
}
