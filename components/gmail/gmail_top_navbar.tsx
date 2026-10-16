'use client';

import React from 'react';
import {
  Search,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface GmailTopNavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeMode?: string;
  onOpenSettings?: () => void;
  isSettingsOpen?: boolean;
  showFlexboxBorders?: boolean;
  onToggleFlexboxBorders?: () => void;
}

export function GmailTopNavbar({
  searchQuery = '',
  onSearchChange,
  activeMode = 'demo',
  onOpenSettings,
  isSettingsOpen = false,
  showFlexboxBorders = true,
  onToggleFlexboxBorders,
}: GmailTopNavbarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-[#f6f8fc] shrink-0 border-b border-[#e0e2ec]/60 select-none">
      {/* Left: InfraTrace Logo & Wordmark (In place of Gmail logo!) */}
      <div className="flex items-center gap-3 cursor-pointer shrink-0 pl-1">
        <img
          src="/infra_trace_logo.png"
          alt="InfraTrace Logo"
          className="w-9 h-9 object-contain drop-shadow-sm transition-transform hover:scale-105"
        />
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-semibold text-[#1f1f1f] tracking-tight font-sans">
            InfraTrace
          </span>
          {activeMode === 'demo' && (
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#eaf1fb] text-[#0b57d0] border border-[#d3e3fd]">
              Observatory
            </span>
          )}
        </div>
      </div>

      {/* Middle: Rounded Pill Search Box */}
      <div className="flex-1 max-w-[720px] mx-4">
        <div className="bg-[#eaf1fb] hover:bg-[#e1e9f5] focus-within:bg-white focus-within:shadow-md transition-all rounded-full h-11 flex items-center px-4 gap-3 border border-transparent focus-within:border-[#c4c7c5]">
          <Search className="w-5 h-5 text-[#444746] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={
              activeMode === 'demo'
                ? 'Search InfraTrace telemetry, services, metrics...'
                : 'Search in InfraTrace'
            }
            className="w-full bg-transparent text-sm text-[#1f1f1f] placeholder:text-[#5e5e5e] outline-none font-sans"
          />
          <button
            type="button"
            title="Search options"
            className="p-1 rounded-full hover:bg-black/5 text-[#444746]"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Toggle Flexbox Boundaries Button */}
        {onToggleFlexboxBorders && (
          <button
            onClick={onToggleFlexboxBorders}
            title="Toggle Flexbox 1-5 Boundaries"
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              showFlexboxBorders
                ? 'bg-red-50 text-red-700 border-red-300 shadow-2xs'
                : 'bg-white text-[#444746] border-[#747775]/30 hover:bg-black/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flexbox Boxes: {showFlexboxBorders ? 'ON' : 'OFF'}</span>
          </button>
        )}

        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#747775]/30 text-xs font-medium text-[#1f1f1f] hover:bg-black/5 cursor-pointer transition-colors">
          <span className="w-2.5 h-2.5 rounded-full bg-[#188038] inline-block" />
          <span>Active</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#444746]" />
        </div>

        {/* Support Help */}
        <button
          title="Support"
          className="p-2 rounded-full hover:bg-black/5 text-[#444746] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isSettingsOpen
              ? 'bg-black/15 text-[#1f1f1f]'
              : 'hover:bg-black/5 text-[#444746]'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Gemini Star */}
        <button
          title="Gemini"
          className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
              fill="url(#gemini_grad)"
            />
            <defs>
              <linearGradient id="gemini_grad" x1="4" y1="2" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1B6EF3" />
                <stop offset="0.5" stopColor="#7C3AED" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </button>

        {/* Upgrade Button */}
        <button className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-medium tracking-wide shadow-sm transition-colors cursor-pointer">
          Upgrade
        </button>

        {/* Google Apps 9-dots Grid */}
        <button
          title="Google apps"
          className="p-2 rounded-full hover:bg-black/5 text-[#444746] transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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

        {/* User Profile Avatar */}
        <div className="relative cursor-pointer ml-1">
          <div className="w-8 h-8 rounded-full bg-[#004d40] text-white font-semibold text-sm flex items-center justify-center ring-2 ring-white shadow-sm">
            H
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#188038] ring-2 ring-white" />
        </div>
      </div>
    </header>
  );
}
