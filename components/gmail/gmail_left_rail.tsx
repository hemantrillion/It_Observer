'use client';

import React from 'react';
import { Mail, MessageSquare, Video, Activity } from 'lucide-react';

export type RailTab = 'mail' | 'chat' | 'meet' | 'demo';

interface GmailLeftRailProps {
  activeTab: RailTab;
  onSelectTab: (tab: RailTab) => void;
}

export function GmailLeftRail({ activeTab, onSelectTab }: GmailLeftRailProps) {
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
      badge: '30A',
    },
  ];

  return (
    <aside className="w-[72px] flex flex-col items-center py-2 shrink-0 bg-[#f6f8fc] space-y-3 select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className="flex flex-col items-center group w-full py-1 cursor-pointer focus:outline-none"
          >
            {/* Pill Capsule */}
            <div
              className={`w-12 h-8 rounded-full flex items-center justify-center relative transition-colors ${
                isActive
                  ? 'bg-[#d3e3fd] text-[#041e49]'
                  : 'text-[#444746] group-hover:bg-black/5'
              }`}
            >
              <IconComponent className="w-5 h-5" />

              {/* Red unread badge for mail */}
              {tab.badge && tab.id === 'mail' && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#b3261e] text-white text-[10px] font-bold rounded-full leading-tight">
                  {tab.badge}
                </span>
              )}

              {/* Subtle badge for demo */}
              {tab.badge && tab.id === 'demo' && (
                <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-[#0b57d0] text-white text-[9px] font-bold rounded-full leading-tight">
                  {tab.badge}
                </span>
              )}
            </div>

            {/* Label below capsule */}
            <span
              className={`text-[11px] mt-1 tracking-tight ${
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
    </aside>
  );
}
