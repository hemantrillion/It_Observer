'use client';

import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';

export function GmailRightRail() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <aside className="w-6 flex flex-col items-center justify-end py-3 shrink-0 bg-[#f6f8fc] border-l border-[#e0e2ec] select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Show side panel"
          className="p-1 rounded-full hover:bg-black/5 text-[#444746] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-14 flex flex-col items-center py-3 shrink-0 bg-[#f6f8fc] border-l border-[#e0e2ec] justify-between select-none">
      {/* Top App Icons */}
      <div className="flex flex-col items-center gap-4">
        {/* Google Calendar */}
        <button
          title="Calendar"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer group"
        >
          <div className="w-6 h-6 rounded bg-[#1a73e8] text-white flex flex-col items-center justify-center shadow-xs">
            <span className="text-[8px] leading-none font-bold uppercase pt-0.5">
              OCT
            </span>
            <span className="text-[11px] leading-tight font-extrabold">31</span>
          </div>
        </button>

        {/* Google Keep */}
        <button
          title="Keep"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-md bg-[#fbbc04] flex items-center justify-center shadow-xs text-white">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
            </svg>
          </div>
        </button>

        {/* Google Tasks */}
        <button
          title="Tasks"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-[#1a73e8] flex items-center justify-center shadow-xs text-white">
            <svg
              className="w-4 h-4 stroke-white fill-none stroke-[3]"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </button>

        {/* Google Contacts */}
        <button
          title="Contacts"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-[#4285f4] flex items-center justify-center shadow-xs text-white">
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </button>

        {/* Divider */}
        <div className="w-5 h-[1px] bg-[#e0e2ec] my-1" />

        {/* Get Add-ons (+) */}
        <button
          title="Get add-ons"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 text-[#444746] transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Collapse Button */}
      <div className="pb-1">
        <button
          onClick={() => setIsCollapsed(true)}
          title="Hide side panel"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#444746] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
