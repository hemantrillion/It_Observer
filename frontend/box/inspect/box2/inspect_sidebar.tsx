'use client';

import React, { useState } from 'react';
import { Pencil, ScanSearch, Activity, Gauge, Shield, Terminal } from 'lucide-react';

export interface InspectSidebarProps {
  hasWallpaper?: boolean;
  allowedElements?: string[];
  activeView?: string;
  onSelectView?: (viewId: string) => void;
}

export const INSPECT_SIDEBAR_ITEMS = [
  { id: 'traces', label: 'Deep Traces', icon: ScanSearch },
  { id: 'probes', label: 'Synthetic Probes', icon: Activity },
  { id: 'latency', label: 'Latency Diagnostics', icon: Gauge },
  { id: 'audits', label: 'Inspection Audits', icon: Shield },
  { id: 'payload', label: 'Raw Payload Trace', icon: Terminal },
];

export function InspectSidebar({
  hasWallpaper = false,
  allowedElements,
  activeView = 'traces',
  onSelectView,
}: InspectSidebarProps) {
  const [selectedView, setSelectedView] = useState(activeView);

  const visibleItems = allowedElements
    ? INSPECT_SIDEBAR_ITEMS.filter((item) => allowedElements.includes(item.id))
    : INSPECT_SIDEBAR_ITEMS;

  const handleSelect = (id: string) => {
    setSelectedView(id);
    onSelectView?.(id);
  };

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
        {visibleItems.map((item) => {
          const isSelected = selectedView === item.id;
          const IconComp = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? hasWallpaper
                    ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs'
                    : 'bg-[#d3e3fd] text-[#041e49]'
                  : hasWallpaper
                  ? 'text-white hover:bg-white/15'
                  : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
              }`}
            >
              <div className="flex items-center gap-4">
                <IconComp className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
