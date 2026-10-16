'use client';

import React from 'react';
import {
  Search,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface GmailTopNavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeMode?: string;
  onOpenSettings?: () => void;
  isSettingsOpen?: boolean;
  showFlexboxBorders?: boolean;
  onToggleFlexboxBorders?: () => void;
  isSidebarOpen?: boolean;
}

export function GmailTopNavbar({
  searchQuery = '',
  onSearchChange,
  activeMode = 'demo',
  onOpenSettings,
  isSettingsOpen = false,
  showFlexboxBorders = true,
  onToggleFlexboxBorders,
  isSidebarOpen = true,
}: GmailTopNavbarProps) {
  return (
    <header className="h-16 flex items-center pr-4 pl-0 bg-[#f6f8fc] shrink-0 border-b border-[#e0e2ec]/60 select-none">
      {/* Left: InfraTrace Logo & Wordmark (Exact width matching Box 2 so search aligns with Box 4) */}
      <div
        className={`${
          isSidebarOpen
            ? (showFlexboxBorders ? 'w-[262px]' : 'w-64')
            : 'w-48'
        } flex items-center gap-3 cursor-pointer shrink-0 pl-3 pr-2 transition-all duration-200`}
      >
        <img
          src="/infra_trace_logo.png"
          alt="InfraTrace Logo"
          className="w-9 h-9 object-contain drop-shadow-sm transition-transform hover:scale-105"
        />
        <span className="text-[22px] font-semibold text-[#1f1f1f] tracking-tight font-sans">
          InfraTrace
        </span>
      </div>

      {/* Middle: Rounded Pill Search Box - Left-aligned on the exact vertical axis where Box 4 begins */}
      <div className="w-[720px] max-w-[calc(100%-420px)] shrink-0">
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

      {/* Spacer pushing controls to the far right, keeping search bar strictly left-aligned */}
      <div className="flex-1 min-w-4" />

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Toggle Flexbox Boundaries Button: strictly 'Flex' text (Green = ON, Red = OFF) */}
        {onToggleFlexboxBorders && (
          <button
            onClick={onToggleFlexboxBorders}
            title={showFlexboxBorders ? 'Flex: ON (Green)' : 'Flex: OFF (Red)'}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
              showFlexboxBorders
                ? 'bg-[#188038] text-white hover:bg-[#137333]'
                : 'bg-[#d93025] text-white hover:bg-[#b3261e]'
            }`}
          >
            Flex
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
