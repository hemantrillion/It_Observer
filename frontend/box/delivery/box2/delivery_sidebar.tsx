'use client';

import React, { useState } from 'react';
import { Pencil, Send, Bell, Layers, Clock, Inbox } from 'lucide-react';

export interface DeliverySidebarProps {
  hasWallpaper?: boolean;
  allowedElements?: string[];
  activeView?: string;
  onSelectView?: (viewId: string) => void;
}

export const DELIVERY_SIDEBAR_ITEMS = [
  { id: 'pipelines', label: 'Notification Pipelines', icon: Send },
  { id: 'rules', label: 'Alert Routing Rules', icon: Bell },
  { id: 'channels', label: 'Delivery Channels', icon: Layers },
  { id: 'sla', label: 'SLA Delivery Status', icon: Clock },
  { id: 'dlq', label: 'Dead Letter Queue', icon: Inbox },
];

export function DeliverySidebar({
  hasWallpaper = false,
  allowedElements,
  activeView = 'pipelines',
  onSelectView,
}: DeliverySidebarProps) {
  const [selectedView, setSelectedView] = useState(activeView);

  const visibleItems = allowedElements
    ? DELIVERY_SIDEBAR_ITEMS.filter((item) => allowedElements.includes(item.id))
    : DELIVERY_SIDEBAR_ITEMS;

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
          <span>New Pipeline</span>
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
