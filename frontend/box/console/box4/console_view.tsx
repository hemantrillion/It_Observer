'use client';

import React from 'react';
import { SystemOverviewMetricsBarContainer } from '@/components/containers/system_overview_metrics_bar_container';
import { ChaosTestingControlPanelContainer } from '@/components/containers/chaos_testing_control_panel_container';

interface ConsoleViewProps {
  hasWallpaper?: boolean;
}

export function ConsoleView({ hasWallpaper = false }: ConsoleViewProps) {
  return (
    <div
      className={`flex-1 flex flex-col h-full ${
        hasWallpaper ? 'bg-transparent' : 'bg-slate-50/60'
      } overflow-y-auto font-sans select-text w-full p-4 md:p-6 space-y-4`}
    >
      {/* 1. Overview Metrics Bar: 0 since no telemetry measured inside Console */}
      <section className="space-y-2.5 w-full">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            System Telemetry Overview
          </h2>
        </div>
        <SystemOverviewMetricsBarContainer
          total={0}
          healthy={0}
          degraded={0}
          down={0}
          activeAlerts={0}
        />
      </section>

      {/* 2. Interactive Chaos Injection Panel (Box A) & Outage Notifications (Box B) Side-by-Side */}
      <section className="w-full flex flex-col md:flex-row gap-4">
        {/* Box A: Chaos Injection Panel */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <ChaosTestingControlPanelContainer onChaosTriggered={() => {}} />
        </div>

        {/* Box B: Outage Notifications */}
        <div className="flex-1 flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <div>
            {/* Header with Title and Severity Legend */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
                  Outage Notifications
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Critical</span>
                </div>
              </div>
            </div>

            {/* Active Outages List */}
            <div className="mt-2.5 space-y-2">
              <div className="py-6 text-center text-xs text-slate-500 font-medium">
                Zero active outages &mdash; all monitored endpoints operating normally.
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <span className="text-xs font-semibold text-slate-400">
              more
            </span>
          </div>
        </div>
      </section>

      {/* Rest of screen kept empty */}
    </div>
  );
}
