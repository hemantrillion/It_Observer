'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import {
  MetricsCategory,
  METRICS_NAVIGATION,
} from '@/components/gmail/gmail_left_sidebar';

interface MetricsSidebarProps {
  activeCategory: MetricsCategory;
  onSelectCategory: (cat: MetricsCategory) => void;
  onSelectSuboption?: (cat: MetricsCategory, suboptionId: string) => void;
  hasWallpaper?: boolean;
}

export function MetricsSidebar({
  activeCategory,
  onSelectCategory,
  onSelectSuboption,
  hasWallpaper = false,
}: MetricsSidebarProps) {
  return (
    <aside className="w-64 flex flex-col py-2 shrink-0 bg-transparent overflow-y-auto select-none">
      <div className="space-y-1 px-2">
        {METRICS_NAVIGATION.map((catItem) => {
          const isSelected = activeCategory === catItem.id;
          const Icon = catItem.icon;

          return (
            <button
              key={catItem.id}
              type="button"
              onClick={() => {
                onSelectCategory(catItem.id);
                if (catItem.id === 'Cloud') {
                  onSelectSuboption?.('Cloud', 'aws');
                } else {
                  onSelectSuboption?.(catItem.id, 'all');
                }
              }}
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
                <span className="font-semibold text-sm tracking-tight truncate">{catItem.label}</span>
              </div>
              {isSelected && (
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform text-[#041e49]" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
