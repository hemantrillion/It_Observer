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
  hasWallpaper?: boolean;
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
  hasWallpaper = false,
}: GmailTopNavbarProps) {
  return (
    <header className="h-16 flex items-center pr-4 pl-0 bg-transparent shrink-0 select-none">
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

      {/* Middle: Rounded Pill Search Box (Level 1: #e9eef6, matching Box 1 darkness ratio) */}
      <div className="w-[720px] max-w-[calc(100%-420px)] shrink-0">
        <div
          className={`${
            hasWallpaper
              ? 'bg-[#e9eef6]/75 hover:bg-[#e9eef6]/85 backdrop-blur-md shadow-xs'
              : 'bg-[#e9eef6] hover:bg-[#dfe6f2]'
          } focus-within:bg-white focus-within:shadow-md transition-all rounded-full h-11 flex items-center px-4 gap-3 border border-transparent focus-within:border-[#c4c7c5]`}
        >
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

        {/* Status Pill (Active) */}
        <div className="hidden md:flex items-center gap-2.5 h-10 px-4 rounded-full border border-[#747775]/35 text-sm font-medium text-[#1f1f1f] hover:bg-black/5 cursor-pointer transition-colors">
          <span className="w-2.5 h-2.5 rounded-full bg-[#188038] inline-block" />
          <span>Active</span>
          <ChevronDown className="w-4 h-4 text-[#444746]" />
        </div>

        {/* Support Help (40px circle with 22px icon) */}
        <button
          title="Support"
          className="w-10 h-10 rounded-full hover:bg-black/10 text-[#444746] transition-colors cursor-pointer flex items-center justify-center"
        >
          <HelpCircle className="w-[22px] h-[22px]" />
        </button>

        {/* Settings (40px circle with 22px icon) */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          className={`w-10 h-10 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
            isSettingsOpen
              ? 'bg-black/15 text-[#1f1f1f]'
              : 'hover:bg-black/10 text-[#444746]'
          }`}
        >
          <Settings className="w-[22px] h-[22px]" />
        </button>

        {/* Google Apps 9-dots Grid (40px circle with 24px icon) */}
        <button
          title="Google apps"
          className="w-10 h-10 rounded-full hover:bg-black/10 text-[#444746] transition-colors cursor-pointer flex items-center justify-center"
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

        {/* User Profile Avatar (40px circle matching real Gmail) */}
        <div className="relative cursor-pointer ml-1">
          <div className="w-10 h-10 rounded-full bg-[#004d40] text-white font-medium text-base flex items-center justify-center shadow-xs">
            H
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#188038] ring-2 ring-white" />
        </div>
      </div>
    </header>
  );
}
