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
    <header className="w-full border-b border-black bg-white sticky top-0 z-40">
      <div className="w-full px-6 md:px-10 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-black text-white font-mono font-bold flex items-center justify-center text-xs">
            30A
          </div>
          <div>
            <h1 className="font-sans font-bold text-base tracking-tight uppercase text-black">
              INFRASTRUCTURE OBSERVATORY
            </h1>
            <p className="font-sans text-[11px] uppercase tracking-wider text-black opacity-60">
              LIGHTWEIGHT TELEMETRY & HEALTH ENGINE
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
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
            <div className="sm:ml-2">
              <RefreshMetricsButtonOnHeader onRefresh={onPoll} isLoading={isPolling} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
