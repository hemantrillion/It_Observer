'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  ChevronDown,
  Lock,
  Plus,
} from 'lucide-react';

interface GmailTopNavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeMode?: string;
  onOpenSettings?: () => void;
  isSettingsOpen?: boolean;
  onOpenAccountMenu?: () => void;
  isAccountMenuOpen?: boolean;
  showFlexboxBorders?: boolean;
  onToggleFlexboxBorders?: () => void;
  isSidebarOpen?: boolean;
  hasWallpaper?: boolean;
  onNavigateLanding?: () => void;
}

export function GmailTopNavbar({
  searchQuery = '',
  onSearchChange,
  activeMode = 'demo',
  onOpenSettings,
  isSettingsOpen = false,
  onOpenAccountMenu,
  isAccountMenuOpen = false,
  showFlexboxBorders = false,
  onToggleFlexboxBorders,
  isSidebarOpen = true,
  hasWallpaper = false,
  onNavigateLanding,
}: GmailTopNavbarProps) {
  const [isPrivateApiMenuOpen, setIsPrivateApiMenuOpen] = useState(false);
  const privateApiMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        privateApiMenuRef.current &&
        !privateApiMenuRef.current.contains(event.target as Node)
      ) {
        setIsPrivateApiMenuOpen(false);
      }
    }
    if (isPrivateApiMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPrivateApiMenuOpen]);
  return (
    <header className="h-16 flex items-center pr-4 pl-0 bg-transparent shrink-0 select-none">
      {/* Left: InfraTrace Logo & Wordmark (Exact width matching Box 2 so search aligns with Box 4) */}
      <div
        onClick={onNavigateLanding}
        title="InfraTrace - Click to view Landing Page"
        className={`${
          isSidebarOpen
            ? (showFlexboxBorders ? 'w-[262px]' : 'w-64')
            : 'w-48'
        } flex items-center gap-3 cursor-pointer shrink-0 pl-3 pr-2 transition-all duration-200 group`}
      >
        <img
          src="/infra_trace_logo.png"
          alt="InfraTrace Logo"
          className="w-9 h-9 object-contain drop-shadow-sm transition-transform hover:scale-105"
        />
        <span
          className={`text-[22px] font-semibold tracking-tight font-sans ${
            hasWallpaper
              ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'text-[#1f1f1f]'
          }`}
        >
          InfraTrace
        </span>
      </div>

      {/* Middle: Rounded Pill Search Box (Level 1: #e9eef6 in default, whitish translucent glass in themed mode) */}
      <div className="w-[720px] max-w-[calc(100%-420px)] shrink-0">
        <div
          className={`group transition-all rounded-full h-11 flex items-center px-4 gap-3 border ${
            hasWallpaper
              ? 'bg-white/15 hover:bg-white/25 border-white/25 text-white backdrop-blur-md focus-within:bg-white focus-within:text-[#1f1f1f] focus-within:border-transparent focus-within:shadow-md'
              : 'bg-[#e9eef6] hover:bg-[#dfe6f2] border-transparent focus-within:bg-white focus-within:border-[#c4c7c5] focus-within:shadow-md'
          }`}
        >
          <Search
            className={`w-5 h-5 shrink-0 transition-colors ${
              hasWallpaper
                ? 'text-white/80 group-focus-within:text-[#444746]'
                : 'text-[#444746]'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search InfraTrace telemetry, services, metrics..."
            className={`w-full bg-transparent text-sm outline-none font-sans ${
              hasWallpaper
                ? 'text-white placeholder:text-white/70 group-focus-within:text-[#1f1f1f] group-focus-within:placeholder:text-[#5e5e5e]'
                : 'text-[#1f1f1f] placeholder:text-[#5e5e5e]'
            }`}
          />
          <button
            type="button"
            title="Search options"
            className={`p-1 rounded-full transition-colors ${
              hasWallpaper
                ? 'hover:bg-white/10 text-white/80 group-focus-within:text-[#444746] group-focus-within:hover:bg-black/5'
                : 'hover:bg-black/5 text-[#444746]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spacer pushing controls to the far right, keeping search bar strictly left-aligned */}
      <div className="flex-1 min-w-4" />

      {/* Right: Controls & Profile (Enlarged to match real Gmail dimensions) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pr-1">
        {/* Toggle Flexbox Boundaries Button: strictly 'Flex' text (Green = ON, Red = OFF) */}
        {onToggleFlexboxBorders && (
          <button
            onClick={onToggleFlexboxBorders}
            title={showFlexboxBorders ? 'Flex: ON (Green)' : 'Flex: OFF (Red)'}
            className={`h-10 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-xs flex items-center justify-center ${
              showFlexboxBorders
                ? 'bg-[#188038] text-white hover:bg-[#137333]'
                : 'bg-[#d93025] text-white hover:bg-[#b3261e]'
            }`}
          >
            Flex
          </button>
        )}

        {/* Private API Dropdown Trigger & Popover */}
        <div className="relative" ref={privateApiMenuRef}>
          <button
            type="button"
            onClick={() => setIsPrivateApiMenuOpen((prev) => !prev)}
            className={`hidden md:flex items-center gap-2.5 h-10 px-4 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'bg-white/15 hover:bg-white/25 border border-white/25 text-white backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'border border-[#747775]/35 text-[#1f1f1f] hover:bg-black/5'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#188038] inline-block shadow-xs" />
            <span>Private API</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isPrivateApiMenuOpen ? 'rotate-180' : ''
              } ${hasWallpaper ? 'text-white' : 'text-[#444746]'}`}
            />
          </button>

          {/* Private API Popover Box (similar to settings/profile popover) */}
          {isPrivateApiMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 px-3 z-50 animate-in fade-in zoom-in-95 text-slate-900 font-sans select-none">
              <div className="px-3 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Private APIs</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Internal VPC & microservice health endpoints
                  </p>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                  Samples
                </span>
              </div>

              {/* Sample unclickable APIs */}
              <div className="py-2 space-y-1.5">
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1 cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Sample Private API Health API
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Sample
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 truncate">
                    https://auth.internal.vpc/healthz
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
                    <span>Port 8443</span>
                    <span>&bull;</span>
                    <span>VPC Private Subnet</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1 cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Cloud API Sample
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Sample
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 truncate">
                    https://cloud.internal-mesh.aws/metrics
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
                    <span>Port 9090</span>
                    <span>&bull;</span>
                    <span>Service Mesh Gateway</span>
                  </div>
                </div>
              </div>

              {/* Unclickable option saying "add new private api" */}
              <div className="pt-2 border-t border-slate-100">
                <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-400 text-xs font-bold cursor-not-allowed select-none">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add new private API</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support Help (40px circle with 22px icon) */}
        <button
          title="Support"
          className={`w-10 h-10 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
            hasWallpaper
              ? 'hover:bg-white/15 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'hover:bg-black/10 text-[#444746]'
          }`}
        >
          <HelpCircle className="w-[22px] h-[22px]" />
        </button>

        {/* Settings (40px circle with 22px icon) */}
        <button
          onClick={onOpenSettings}
          data-panel-trigger="quick-settings"
          title="Settings"
          aria-label="Settings"
          className={`w-10 h-10 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
            isSettingsOpen
              ? hasWallpaper
                ? 'bg-white/20 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'bg-black/15 text-[#1f1f1f]'
              : hasWallpaper
              ? 'hover:bg-white/15 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'hover:bg-black/10 text-[#444746]'
          }`}
        >
          <Settings className="w-[22px] h-[22px]" />
        </button>

        {/* Google Apps 9-dots Grid (40px circle with 24px icon) */}
        <button
          title="Google apps"
          aria-label="Google apps"
          className={`w-10 h-10 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
            hasWallpaper
              ? 'hover:bg-white/15 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'hover:bg-black/10 text-[#444746]'
          }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6" cy="6" r="2" />
            <circle cx="12" cy="6" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="12" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
        </button>

        {/* User Profile Avatar (40px circle matching real Gmail without dot) */}
        <button
          type="button"
          onClick={onOpenAccountMenu}
          data-panel-trigger="account-flyout"
          title="Google Account"
          aria-label="Google Account"
          className="relative cursor-pointer ml-1 focus:outline-none"
        >
          <div
            className={`w-10 h-10 rounded-full bg-[#004d40] text-white font-medium text-base flex items-center justify-center shadow-xs transition-transform hover:scale-105 ${
              isAccountMenuOpen ? 'ring-2 ring-white/80' : ''
            }`}
          >
            H
          </div>
        </button>
      </div>
    </header>
  );
}
