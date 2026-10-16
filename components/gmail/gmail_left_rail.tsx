'use client';

import React from 'react';
import { Menu, Mail, MessageSquare, Video, Activity } from 'lucide-react';

export type RailTab = 'mail' | 'chat' | 'meet' | 'demo';

interface GmailLeftRailProps {
  activeTab: RailTab;
  onSelectTab: (tab: RailTab) => void;
  onToggleSidebar?: () => void;
}

export function GmailLeftRail({
  activeTab,
  onSelectTab,
  onToggleSidebar,
}: GmailLeftRailProps) {
  const tabs = [
    {
      id: 'mail' as RailTab,
      label: 'Mail',
      icon: Mail,
      badge: '99+',
    },
    {
      id: 'chat' as RailTab,
      label: 'Chat',
      icon: MessageSquare,
    },
    {
      id: 'meet' as RailTab,
      label: 'Meet',
      icon: Video,
    },
    {
      id: 'demo' as RailTab,
      label: 'Demo',
      icon: Activity,
    },
  ];

  return (
    <aside className="w-[72px] h-full flex flex-col items-center py-2 shrink-0 bg-[#f6f8fc] space-y-4 select-none">
      {/* Collapse button on left (Hamburger menu) - 48px circle with 24px icon */}
      <button
        onClick={onToggleSidebar}
        aria-label="Main menu"
        title="Main menu (Collapse / Expand Sidebar)"
        className="w-12 h-12 rounded-full hover:bg-black/10 text-[#444746] transition-colors flex items-center justify-center focus:outline-none cursor-pointer"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Navigation tabs */}
      <div className="flex flex-col items-center space-y-3.5 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center group w-full py-1 cursor-pointer focus:outline-none"
            >
              {/* Pill Capsule (56px x 32px with 24px icon matching real Gmail) */}
              <div
                className={`w-14 h-8 rounded-full flex items-center justify-center relative transition-colors ${
                  isActive
                    ? 'bg-[#d3e3fd] text-[#041e49]'
                    : 'text-[#444746] group-hover:bg-black/5'
                }`}
              >
                <IconComponent className="w-6 h-6 stroke-[1.8]" />

                {/* Red unread badge for mail */}
                {tab.badge && tab.id === 'mail' && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[20px] text-center bg-[#b3261e] text-white text-[11px] font-bold rounded-full leading-tight shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label below capsule */}
              <span
                className={`text-xs mt-1.5 tracking-tight ${
                  isActive
                    ? 'font-bold text-[#041e49]'
                    : 'font-medium text-[#444746] group-hover:text-[#1f1f1f]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
