'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  hasWallpaper?: boolean;
}

export function SearchBar({
  searchQuery = '',
  onSearchChange,
  hasWallpaper = false,
}: SearchBarProps) {
  return (
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
              ? 'text-white placeholder-white/70 group-focus-within:text-[#1f1f1f] group-focus-within:placeholder-[#444746]'
              : 'text-[#1f1f1f] placeholder-[#444746]'
          }`}
        />
        <button
          title="Search filters"
          className={`p-1 rounded-full transition-colors ${
            hasWallpaper
              ? 'hover:bg-white/20 text-white/80 group-focus-within:text-[#444746] group-focus-within:hover:bg-black/5'
              : 'hover:bg-black/5 text-[#444746]'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
