'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronUp, ChevronDown, Plus, LogOut, Check } from 'lucide-react';
import { UserAccount, getStoredAccounts, getActiveAccount, setActiveAccount, removeAccount, clearAllAccounts } from '@/lib/auth/accounts_manager';

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
  onNavigateAddAccount,
  onAccountChanged,
}: GmailAccountFlyoutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeUser, setActiveUserState] = useState<UserAccount>(getActiveAccount());
  const [showAccountList, setShowAccountList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const all = getStoredAccounts();
      const current = getActiveAccount();
      setAccounts(all);
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

  if (!isOpen) return null;

  const handleSwitchAccount = (acc: UserAccount) => {
    setActiveAccount(acc);
    setActiveUserState(acc);
    onAccountChanged?.(acc);
    onClose();
  };

  const handleSignOutSingle = () => {
    const nextAcc = removeAccount(activeUser.email);
    if (nextAcc) {
      setActiveUserState(nextAcc);
      onAccountChanged?.(nextAcc);
      onClose();
    } else {
      onClose();
      if (onNavigateLanding) {
        onNavigateLanding();
      } else {
        window.location.href = '/';
      }
    }
  };

  const handleSignOutAll = () => {
    clearAllAccounts();
    onClose();
    if (onNavigateLanding) {
      onNavigateLanding();
    } else {
      window.location.href = '/';
    }
  };

  const otherAccounts = accounts.filter((a) => a.email.toLowerCase() !== activeUser.email.toLowerCase());

  return (
    <div
      ref={panelRef}
      className="absolute top-16 right-4 z-50 w-[360px] bg-white text-slate-900 rounded-[28px] shadow-2xl border border-slate-200/90 p-4 space-y-3 font-sans select-none animate-in fade-in slide-in-from-top-2 duration-150"
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

      {/* Main Account Info & Account Actions Container */}
      <div className="bg-slate-50/80 rounded-2xl overflow-hidden divide-y divide-slate-100 border border-slate-200/80 shadow-2xs">
        {/* Active Profile Card Row */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular Avatar with user avatar or InfraTrace logo */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
                <img
                  src={activeUser.avatarUrl || '/infra_trace_logo.png'}
                  alt={activeUser.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>

            {/* Name & Email Address */}
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight truncate">
                {activeUser.name}
              </span>
              <span className="text-xs text-slate-500 font-normal truncate max-w-[175px] mt-0.5">
                {activeUser.email}
              </span>
            </div>
          </div>

          {/* Toggle other accounts accordion */}
          {otherAccounts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAccountList(!showAccountList)}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title={showAccountList ? 'Hide other accounts' : 'Show other accounts'}
            >
              {showAccountList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Other Accounts List (when expanded) */}
        {showAccountList && otherAccounts.length > 0 && (
          <div className="bg-slate-100/60 divide-y divide-slate-200/60 max-h-48 overflow-y-auto">
            {otherAccounts.map((acc) => (
              <div
                key={acc.email}
                onClick={() => handleSwitchAccount(acc)}
                className="p-3 flex items-center justify-between hover:bg-slate-200/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                    <img src={acc.avatarUrl || '/infra_trace_logo.png'} alt={acc.name} className="w-5 h-5 object-contain" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 truncate">{acc.name}</span>
                    <span className="text-[11px] text-slate-500 truncate">{acc.email}</span>
                  </div>
                </div>
                <span className="text-xs text-blue-600 font-medium shrink-0">Switch</span>
              </div>
            ))}
          </div>
        )}

        {/* Action: Add another account */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onNavigateAddAccount) {
              onNavigateAddAccount();
            } else {
              window.location.href = '/?mode=add_account';
            }
          }}
          className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-100/70 text-slate-700 text-sm font-medium transition-colors text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add another account</span>
        </button>

        {/* Action: Sign out of this account */}
        <button
          type="button"
          onClick={handleSignOutSingle}
          className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-slate-100/70 text-slate-700 text-sm font-medium transition-colors text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Sign out of this account</span>
        </button>

        {/* Action: Sign out of all accounts */}
        {accounts.length > 1 && (
          <button
            type="button"
            onClick={handleSignOutAll}
            className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Sign out of all accounts</span>
          </button>
        )}
      </div>

      {/* Manage your Account button with InfraTrace logo */}
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
