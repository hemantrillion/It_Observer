'use client';

import React from 'react';
import { Pencil, Send, Bell, Layers, Clock, Inbox } from 'lucide-react';

interface DeliverySidebarProps {
  hasWallpaper?: boolean;
}

export function DeliverySidebar({ hasWallpaper = false }: DeliverySidebarProps) {
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
          <span>New Pipeline</span>
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
            <Send className="w-5 h-5" />
            <span>Notification Pipelines</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5" />
            <span>Alert Routing Rules</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Layers className="w-5 h-5" />
            <span>Delivery Channels</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5" />
            <span>SLA Delivery Status</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper ? 'text-white hover:bg-white/15' : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Inbox className="w-5 h-5" />
            <span>Dead Letter Queue</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
