'use client';

import React from 'react';
import {
  Pencil,
  RefreshCw,
  Inbox,
  Star,
  Clock,
  Send,
  File,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutDashboard,
  AlertTriangle,
  Sliders,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { RailTab } from './gmail_left_rail';

export type DemoSubView = 'dashboard' | 'incidents' | 'settings' | 'metrics';
export type StatusFilter = 'ALL' | 'HEALTHY' | 'DEGRADED' | 'DOWN';

interface GmailLeftSidebarProps {
  activeTab: RailTab;
  demoSubView: DemoSubView;
  onSelectDemoSubView: (view: DemoSubView) => void;
  statusFilter: StatusFilter;
  onSelectStatusFilter: (filter: StatusFilter) => void;
  onPoll: () => void;
  isPolling: boolean;
  incidentCount?: number;
  healthyCount?: number;
  degradedCount?: number;
  downCount?: number;
  totalServicesCount?: number;
  hasWallpaper?: boolean;
}

export function GmailLeftSidebar({
  activeTab,
  demoSubView,
  onSelectDemoSubView,
  statusFilter,
  onSelectStatusFilter,
  onPoll,
  isPolling,
  incidentCount = 1,
  healthyCount = 5,
  degradedCount = 1,
  downCount = 0,
  totalServicesCount = 6,
  hasWallpaper = false,
}: GmailLeftSidebarProps) {
  const isDemo = activeTab === 'demo' || activeTab === 'metrics';

  return (
    <aside className="w-64 flex flex-col px-3 py-2 shrink-0 bg-transparent overflow-y-auto select-none">
      {/* Top Action Button: "Poll Now" in Demo mode, "+ Compose" in Mail mode */}
      <div className="mb-4 pt-1">
        {isDemo ? (
          <button
            onClick={onPoll}
            disabled={isPolling}
            className={`rounded-2xl font-semibold text-sm px-6 py-4 flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 ${
              hasWallpaper
                ? 'bg-white hover:bg-white/90 text-[#001d35] shadow-md hover:shadow-lg'
                : 'bg-[#c2e7ff] hover:bg-[#b3d7ef] hover:shadow-md text-[#001d35] shadow-sm'
            }`}
          >
            <RefreshCw
              className={`w-5 h-5 text-[#001d35] ${
                isPolling ? 'animate-spin' : ''
              }`}
            />
            <span>{isPolling ? 'Polling...' : 'Poll Now'}</span>
          </button>
        ) : (
          <button
            className={`rounded-2xl font-semibold text-sm px-6 py-4 flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
              hasWallpaper
                ? 'bg-white hover:bg-white/90 text-[#001d35] shadow-md hover:shadow-lg'
                : 'bg-[#c2e7ff] hover:bg-[#b3d7ef] hover:shadow-md text-[#001d35] shadow-sm'
            }`}
          >
            <Pencil className="w-5 h-5 text-[#001d35]" />
            <span>Compose</span>
          </button>
        )}
      </div>

      {/* Navigation Links based on active tab */}
      {isDemo ? (
        <div className="space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => onSelectDemoSubView('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
              demoSubView === 'dashboard'
                ? hasWallpaper
                  ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                  : 'bg-[#d3e3fd] text-[#041e49]'
                : hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <LayoutDashboard className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
              <span>Dashboard</span>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                hasWallpaper ? 'bg-white/25 text-white' : 'bg-black/10 text-[#444746]'
              }`}
            >
              {totalServicesCount}
            </span>
          </button>

          {/* Incidents */}
          <button
            onClick={() => onSelectDemoSubView('incidents')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
              demoSubView === 'incidents'
                ? hasWallpaper
                  ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                  : 'bg-[#d3e3fd] text-[#041e49]'
                : hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <AlertTriangle
                className={`w-5 h-5 ${hasWallpaper ? 'text-amber-300' : 'text-amber-600'}`}
              />
              <span>Incidents</span>
            </div>
            {incidentCount > 0 && (
              <span className="text-xs bg-[#b3261e] text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                {incidentCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => onSelectDemoSubView('settings')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
              demoSubView === 'settings'
                ? hasWallpaper
                  ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                  : 'bg-[#d3e3fd] text-[#041e49]'
                : hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Sliders className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
              <span>Settings</span>
            </div>
          </button>

          {/* Prometheus Metrics */}
          <a
            href="/metrics"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
              hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <BarChart2 className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
              <span>Metrics (/metrics)</span>
            </div>
            <span
              className={`text-xs uppercase font-extrabold px-1.5 py-0.5 rounded ${
                hasWallpaper ? 'bg-sky-400/30 text-sky-200' : 'bg-blue-100 text-[#0b57d0]'
              }`}
            >
              RAW
            </span>
          </a>

          {/* Telemetry Filters Section */}
          <div
            className={`pt-4 border-t mt-3 ${
              hasWallpaper ? 'border-white/20' : 'border-[#e0e2ec]'
            }`}
          >
            <div
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                hasWallpaper ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]' : 'text-[#444746]'
              }`}
            >
              <span>Status Filters</span>
            </div>

            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => onSelectStatusFilter('ALL')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? hasWallpaper
                      ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                      : 'bg-[#eaf1fb] text-[#041e49]'
                    : hasWallpaper
                    ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                    : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
                }`}
              >
                <span>All Targets</span>
                <span className="font-bold">{totalServicesCount}</span>
              </button>

              <button
                onClick={() => onSelectStatusFilter('HEALTHY')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'HEALTHY'
                    ? hasWallpaper
                      ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                      : 'bg-[#eaf1fb] text-[#041e49]'
                    : hasWallpaper
                    ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                    : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-xs" />
                  <span>Healthy</span>
                </div>
                <span className="font-bold">{healthyCount}</span>
              </button>

              <button
                onClick={() => onSelectStatusFilter('DEGRADED')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'DEGRADED'
                    ? hasWallpaper
                      ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                      : 'bg-[#eaf1fb] text-[#041e49]'
                    : hasWallpaper
                    ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                    : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-xs" />
                  <span>Degraded</span>
                </div>
                <span className="font-bold">{degradedCount}</span>
              </button>

              <button
                onClick={() => onSelectStatusFilter('DOWN')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'DOWN'
                    ? hasWallpaper
                      ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                      : 'bg-[#eaf1fb] text-[#041e49]'
                    : hasWallpaper
                    ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                    : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-xs" />
                  <span>Down</span>
                </div>
                <span className="font-bold">{downCount}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mail mode folders matching screenshot */
        <div className="space-y-1">
          {/* Inbox */}
          <div
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'bg-[#d3e3fd] text-[#041e49]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Inbox
                className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#041e49]'}`}
              />
              <span>Inbox</span>
            </div>
            <span className="text-xs font-bold">433</span>
          </div>

          {/* Starred */}
          <div
            className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Star
                className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#444746]'}`}
              />
              <span>Starred</span>
            </div>
          </div>

          {/* Snoozed */}
          <div
            className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Clock
                className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#444746]'}`}
              />
              <span>Snoozed</span>
            </div>
          </div>

          {/* Sent */}
          <div
            className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Send
                className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#444746]'}`}
              />
              <span>Sent</span>
            </div>
          </div>

          {/* Drafts */}
          <div
            className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <File
                className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#444746]'}`}
              />
              <span>Drafts</span>
            </div>
            <span
              className={`text-xs font-bold ${
                hasWallpaper ? 'text-white' : 'text-[#444746]'
              }`}
            >
              1
            </span>
          </div>

          {/* Purchases */}
          <div
            className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <ShoppingBag
                className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#444746]'}`}
              />
              <span>Purchases</span>
            </div>
            <span
              className={`text-xs font-bold ${
                hasWallpaper ? 'text-white' : 'text-[#444746]'
              }`}
            >
              19
            </span>
          </div>

          {/* More */}
          <div
            className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-sm font-semibold cursor-pointer transition-colors ${
              hasWallpaper
                ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-4">
              <ChevronDown
                className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#444746]'}`}
              />
              <span>More</span>
            </div>
          </div>

          {/* Labels section */}
          <div
            className={`pt-4 border-t mt-3 ${
              hasWallpaper ? 'border-white/20' : 'border-[#e0e2ec]'
            }`}
          >
            <div
              className={`px-4 py-1.5 flex items-center justify-between text-sm font-semibold ${
                hasWallpaper ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]' : 'text-[#444746]'
              }`}
            >
              <span>Labels</span>
              <button
                className={`p-1 rounded-full ${
                  hasWallpaper ? 'hover:bg-white/15' : 'hover:bg-black/5'
                }`}
              >
                <Plus
                  className={`w-4 h-4 ${
                    hasWallpaper ? 'text-white' : 'text-[#444746]'
                  }`}
                />
              </button>
            </div>
            <div
              className={`w-full flex items-center gap-4 px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                hasWallpaper
                  ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                  : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
              }`}
            >
              <ChevronRight
                className={`w-4 h-4 ${
                  hasWallpaper ? 'text-white' : 'text-[#444746]'
                }`}
              />
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
