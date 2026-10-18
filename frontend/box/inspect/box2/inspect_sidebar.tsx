'use client';

import React from 'react';
import { Pencil, ScanSearch, Activity, Gauge, Shield, Terminal } from 'lucide-react';

interface InspectSidebarProps {
  hasWallpaper?: boolean;
}

export function InspectSidebar({ hasWallpaper = false }: InspectSidebarProps) {
  return (
    <aside className="w-64 flex flex-col px-3 py-2 shrink-0 bg-transparent overflow-y-auto select-none">
      <div className="mb-4 pt-1">
        <button
          className={`rounded-2xl font-semibold text-sm px-6 py-4 flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
            hasWallpaper
              ? 'bg-white hover:bg-white/90 text-[#001d35] shadow-md hover:shadow-lg'
              : 'bg-[#c2e7ff] hover:bg-[#b3d7ef] hover:shadow-md text-[#001d35] shadow-sm'
          }`}
        >
          <Pencil className="w-5 h-5 text-[#001d35]" />
          <span>New Inspection</span>
        </button>
      </div>

      <div className="space-y-0.5">
        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs'
              : 'bg-[#d3e3fd] text-[#041e49]'
          }`}
        >
          <div className="flex items-center gap-4">
            <ScanSearch className="w-5 h-5" />
            <span>Deep Traces</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Activity className="w-5 h-5" />
            <span>Synthetic Probes</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Gauge className="w-5 h-5" />
            <span>Latency Diagnostics</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Shield className="w-5 h-5" />
            <span>Inspection Audits</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Terminal className="w-5 h-5" />
            <span>Raw Payload Trace</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
