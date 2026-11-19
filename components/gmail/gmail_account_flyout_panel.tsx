'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, LogOut } from 'lucide-react';
import {
  UserAccount,
  getActiveAccount,
  removeAccount,
  signOutActiveAccount,
} from '@/lib/auth/accounts_manager';

interface GmailAccountFlyoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateLanding?: () => void;
  onNavigateAccount?: () => void;
  onNavigateAddAccount?: () => void;
  onAccountChanged?: (account: UserAccount) => void;
}

export function GmailAccountFlyoutPanel({
  isOpen,
  onClose,
  onNavigateLanding,
  onNavigateAccount,
}: GmailAccountFlyoutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeUser, setActiveUserState] = useState<UserAccount>(getActiveAccount());

  useEffect(() => {
    if (isOpen) {
      const current = getActiveAccount();
      setActiveUserState(current);
    }
  }, [isOpen]);

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

  // Demo sessions should never open this account flyout box
  if (!isOpen || activeUser.role === 'Demo') return null;

  const handleSignOut = async () => {
    removeAccount(activeUser.email);
    await signOutActiveAccount();
    onClose();
    if (onNavigateLanding) {
      onNavigateLanding();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute top-16 right-4 z-50 w-[340px] bg-white text-slate-900 rounded-[28px] shadow-2xl border border-slate-200/90 p-4 space-y-3 font-sans select-none animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Top Header with Close (X) button */}
      <div className="flex items-center justify-between px-2 pt-0.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Single Account Card */}
      <div className="bg-slate-50/80 rounded-2xl overflow-hidden divide-y divide-slate-100 border border-slate-200/80 shadow-2xs">
        {/* Active Profile Card */}
        <div className="p-4 flex items-center gap-3.5">
          {/* Circular Avatar */}
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200 shrink-0">
            <img
              src={activeUser.profilePicture || activeUser.avatarUrl || '/avatars/hemant_kumar.jpg'}
              alt={activeUser.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name & Email */}
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight truncate">
              {activeUser.name}
            </span>
            <span className="text-xs text-slate-500 font-normal truncate max-w-[220px] mt-0.5">
              {activeUser.email}
            </span>
          </div>
        </div>

        {/* Action: Single Sign out button (only one account in browser at a time) */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100/70 text-slate-700 text-sm font-medium transition-colors text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Sign out of this account</span>
        </button>
      </div>

      {/* Manage your Account button */}
      <button
        type="button"
        onClick={() => {
          onClose();
          if (onNavigateAccount) {
            onNavigateAccount();
          } else {
            window.location.href = '/account';
          }
        }}
        className="w-full py-2.5 px-4 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 flex items-center justify-center gap-2.5 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
      >
        <img
          src="/infra_trace_logo.png"
          alt="InfraTrace"
          className="w-4 h-4 object-contain shrink-0"
        />
        <span className="truncate">Manage your Account</span>
      </button>

      {/* Footer Links */}
      <div className="pt-1 pb-0.5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
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
