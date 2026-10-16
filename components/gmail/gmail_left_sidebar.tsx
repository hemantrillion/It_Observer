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
  Users,
  Globe,
  ShieldCheck,
  Key,
  FileText,
  Gauge,
  Cloud,
  Box,
  Layers,
  Cpu,
  Server,
  Activity,
  CreditCard,
} from 'lucide-react';
import { RailTab } from './gmail_left_rail';

export type DemoSubView = 'dashboard' | 'incidents' | 'settings';
export type StatusFilter = 'ALL' | 'HEALTHY' | 'DEGRADED' | 'DOWN';

export const METRICS_CATEGORIES = [
  'Cloud',
  'Containers',
  'Frontend',
  'Infrastructure',
  'Kubernetes',
  'Process',
  'Runtime',
  'Service',
  'Synthetic',
  'Billing',
] as const;

export type MetricsCategory = (typeof METRICS_CATEGORIES)[number];

export type UserSection =
  | 'accounts'
  | 'websites'
  | 'roles'
  | 'apikeys'
  | 'audit';

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
  activeMetricsCategory?: MetricsCategory;
  onSelectMetricsCategory?: (cat: MetricsCategory) => void;
  activeUserSection?: UserSection;
  onSelectUserSection?: (section: UserSection) => void;
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
  activeMetricsCategory = 'Infrastructure',
  onSelectMetricsCategory,
  activeUserSection = 'accounts',
  onSelectUserSection,
}: GmailLeftSidebarProps) {
  // ==========================================================
  // VIEW 1: METRICS MODE (Sidebar populated from Image 2 & 3)
  // ==========================================================
  if (activeTab === 'metrics') {
    return (
      <aside className="w-64 flex flex-col py-2 shrink-0 bg-transparent overflow-y-auto select-none">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gauge className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#0b57d0]'}`} />
            <span
              className={`text-sm font-bold uppercase tracking-wider ${
                hasWallpaper ? 'text-white drop-shadow-sm' : 'text-[#1f1f1f]'
              }`}
            >
              Metrics Categories
            </span>
          </div>
        </div>

        {/* Categories List matching Image 2 & Image 3 reference */}
        <div className="divide-y divide-white/10 border-t border-b border-white/10">
          {METRICS_CATEGORIES.map((cat) => {
            const isSelected = activeMetricsCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectMetricsCategory?.(cat)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-left font-bold text-sm tracking-tight transition-all cursor-pointer ${
                  isSelected
                    ? hasWallpaper
                      ? 'bg-white/20 text-white backdrop-blur-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                      : 'bg-[#d3e3fd] text-[#041e49]'
                    : hasWallpaper
                    ? 'text-white/90 hover:bg-white/10 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                    : 'text-[#1f1f1f] hover:bg-black/5'
                }`}
              >
                <span>{cat}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? 'opacity-100 translate-x-0.5' : 'opacity-40'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  // ==========================================================
  // VIEW 2: USERS MODE (User management, websites, roles)
  // ==========================================================
  if (activeTab === 'users') {
    const userSections: { id: UserSection; label: string; icon: React.ElementType }[] = [
      { id: 'accounts', label: 'User Accounts', icon: Users },
      { id: 'websites', label: 'Monitored Websites', icon: Globe },
      { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
      { id: 'apikeys', label: 'API Keys & Webhooks', icon: Key },
      { id: 'audit', label: 'User Audit Logs', icon: FileText },
    ];

    return (
      <aside className="w-64 flex flex-col py-2 shrink-0 bg-transparent overflow-y-auto select-none">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className={`w-5 h-5 ${hasWallpaper ? 'text-white' : 'text-[#0b57d0]'}`} />
            <span
              className={`text-sm font-bold uppercase tracking-wider ${
                hasWallpaper ? 'text-white drop-shadow-sm' : 'text-[#1f1f1f]'
              }`}
            >
              User Management
            </span>
          </div>
        </div>

        {/* User Sections List */}
        <div className="space-y-1 px-2">
          {userSections.map((sec) => {
            const isSelected = activeUserSection === sec.id;
            const IconComp = sec.icon;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectUserSection?.(sec.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? hasWallpaper
                      ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                      : 'bg-[#d3e3fd] text-[#041e49]'
                    : hasWallpaper
                    ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                    : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComp className={`w-4 h-4 ${hasWallpaper ? 'text-white' : ''}`} />
                  <span>{sec.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  // ==========================================================
  // VIEW 3: DEMO MODE (PURE DEMO ONLY - NO USERS / NO DB)
  // ==========================================================
  if (activeTab === 'demo') {
    return (
      <aside className="w-64 flex flex-col px-3 py-2 shrink-0 bg-transparent overflow-y-auto select-none">
        {/* Top Action Button: "Poll Now" */}
        <div className="mb-4 pt-1">
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
        </div>

        {/* Navigation Links strictly for Demo */}
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

          {/* Raw Metrics in Demo (/metrics) */}
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
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs" />
                  <span>Down</span>
                </div>
                <span className="font-bold">{downCount}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ==========================================================
  // VIEW 4: DEFAULT MAIL / CHAT MODE
  // ==========================================================
  return (
    <aside className="w-64 flex flex-col px-3 py-2 shrink-0 bg-transparent overflow-y-auto select-none">
      {/* Top Action Button: "+ Compose" */}
      <div className="mb-4 pt-1">
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
      </div>

      <div className="space-y-0.5">
        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'bg-white/20 text-white backdrop-blur-sm shadow-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'bg-[#d3e3fd] text-[#041e49]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Inbox className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
            <span>Inbox</span>
          </div>
          <span className="text-xs font-bold">128</span>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Star className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
            <span>Starred</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Clock className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
            <span>Snoozed</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <Send className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
            <span>Sent</span>
          </div>
        </button>

        <button
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-full text-sm font-semibold transition-colors cursor-pointer ${
            hasWallpaper
              ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
              : 'text-[#444746] hover:bg-black/5 hover:text-[#1f1f1f]'
          }`}
        >
          <div className="flex items-center gap-4">
            <File className={`w-5 h-5 ${hasWallpaper ? 'text-white' : ''}`} />
            <span>Drafts</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
