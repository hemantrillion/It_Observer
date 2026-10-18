'use client';

import React from 'react';
import { Terminal, Shield, Cpu, Activity } from 'lucide-react';

interface ConsoleSidebarProps {
  hasWallpaper?: boolean;
}

export function ConsoleSidebar({ hasWallpaper = false }: ConsoleSidebarProps) {
  return (
    <aside className="w-64 flex flex-col py-2 shrink-0 bg-transparent overflow-y-auto select-none">
      <div className="space-y-1 px-2">
        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs'
              : 'bg-[#d3e3fd] text-[#041e49]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4" />
            <span>Interactive Shell</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'text-white hover:bg-white/15'
              : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4" />
            <span>Worker Processes</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'text-white hover:bg-white/15'
              : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4" />
            <span>Cluster Security</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
