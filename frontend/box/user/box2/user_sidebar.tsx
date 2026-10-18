'use client';

import React from 'react';
import { Users, Globe, ShieldCheck, Key, FileText } from 'lucide-react';
import { UserSection } from '@/components/gmail/gmail_left_sidebar';

interface UserSidebarProps {
  activeSection: UserSection;
  onSelectSection: (s: UserSection) => void;
  hasWallpaper?: boolean;
}

export function UserSidebar({
  activeSection,
  onSelectSection,
  hasWallpaper = false,
}: UserSidebarProps) {
  const userSections: { id: UserSection; label: string; icon: React.ElementType }[] = [
    { id: 'accounts', label: 'User Accounts', icon: Users },
    { id: 'websites', label: 'Monitored Websites', icon: Globe },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'apikeys', label: 'API Keys & Webhooks', icon: Key },
    { id: 'audit', label: 'User Audit Logs', icon: FileText },
  ];

  return (
    <aside className="w-64 flex flex-col py-2 shrink-0 bg-transparent overflow-y-auto select-none">
      <div className="space-y-1 px-2">
        {userSections.map((section) => {
          const isSelected = activeSection === section.id;
          const Icon = section.icon;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
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
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-sm tracking-tight truncate">
                  {section.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
