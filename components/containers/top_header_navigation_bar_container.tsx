'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { NavigationTabButtonOnNavBar } from '../buttons/navigation_tab_button_on_nav_bar';
import { RefreshMetricsButtonOnHeader } from '../buttons/refresh_metrics_button_on_header';

interface TopHeaderNavigationBarContainerProps {
  onPoll?: () => void;
  isPolling?: boolean;
}

export function TopHeaderNavigationBarContainer({ onPoll, isPolling = false }: TopHeaderNavigationBarContainerProps) {
  const pathname = usePathname();

  return (
    <header className="border-b-4 border-black bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white font-mono font-black flex items-center justify-center border-2 border-black text-sm">
            30A
          </div>
          <div>
            <h1 className="font-mono font-black text-lg tracking-tight uppercase">
              INFRASTRUCTURE OBSERVATORY
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              LIGHTWEIGHT TELEMETRY & HEALTH ENGINE
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <NavigationTabButtonOnNavBar
            label="[ DASHBOARD ]"
            href="/"
            isActive={pathname === '/'}
          />
          <NavigationTabButtonOnNavBar
            label="[ INCIDENTS ]"
            href="/incidents"
            isActive={pathname === '/incidents'}
          />
          <NavigationTabButtonOnNavBar
            label="[ SETTINGS ]"
            href="/settings"
            isActive={pathname === '/settings'}
          />

          {onPoll && (
            <div className="ml-2">
              <RefreshMetricsButtonOnHeader onRefresh={onPoll} isLoading={isPolling} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
